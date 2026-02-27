using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TenappCore.Data;
using TenappCore.DTOs;
using TenappCore.Models;
using TenappCore.Services.Mailgun;

namespace TenappCore.Services;

public class AuthService : IAuthService
{
    private const string AccessCookieName = "accessToken";
    private const string RefreshCookieName = "refreshToken";
    private static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromHours(1);
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IMailgunService _mailgunService;
    private readonly ILogger<AuthService> _logger;
    private readonly string _passwordResetBaseUrl;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    private readonly SymmetricSecurityKey _signingKey;

    public AuthService(
        AppDbContext dbContext,
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        IMailgunService mailgunService,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _mailgunService = mailgunService;
        _logger = logger;
        _passwordResetBaseUrl = configuration["Auth:PasswordResetBaseUrl"] ?? "http://localhost:3001/reset-password";
        _jwtIssuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing");
        _jwtAudience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing");
        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing");
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    }

    public async Task<AuthResult<UserResponseDto>> RegisterAsync(RegisterUserDto dto, HttpRequest request, HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(dto.Login) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password) ||
            string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.SecondName))
        {
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "login, email, password, firstName and secondName are required");
        }

        var login = dto.Login?.Trim().ToLowerInvariant() ?? string.Empty;
        var email = NormalizeEmail(dto.Email);
        if (!IsValidEmail(email))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "Invalid email format");
        if (dto.Password.Length < 6)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "Password must be at least 6 characters long");

        var exists = await _dbContext.Users.AnyAsync(u => u.Login == login || u.Email == email);
        if (exists)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status409Conflict, "Login or email already exists");

        var user = new User
        {
            Login = login,
            Email = email,
            FirstName = dto.FirstName.Trim(),
            SecondName = dto.SecondName.Trim(),
            PasswordHash = string.Empty
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        await IssueTokensAsync(user, response, request);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task<AuthResult<UserResponseDto>> LoginAsync(LoginUserDto dto, HttpRequest request, HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(dto.Password) ||
            (string.IsNullOrWhiteSpace(dto.Login) && string.IsNullOrWhiteSpace(dto.Email)))
        {
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "password and either login or email are required");
        }

        var login = dto.Login?.Trim().ToLowerInvariant() ?? string.Empty;
        var email = NormalizeEmail(dto.Email);
        var user = !string.IsNullOrWhiteSpace(email)
            ? await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email)
            : await _dbContext.Users.FirstOrDefaultAsync(u => u.Login == login);
        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials");

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials");

        await IssueTokensAsync(user, response, request);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task<AuthResult<UserResponseDto>> RefreshAsync(HttpRequest request, HttpResponse response)
    {
        if (!request.Cookies.TryGetValue(RefreshCookieName, out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Refresh token is missing");

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid refresh token");

        var principal = ValidateToken(refreshToken, expectedTokenType: "refresh");
        if (principal == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Expired or invalid refresh token");

        if (!TryGetUserId(principal, out var subjectUserId) || subjectUserId != user.Id)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Refresh token subject mismatch");

        await IssueTokensAsync(user, response, request);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return;

        var email = NormalizeEmail(dto.Email);
        if (!IsValidEmail(email))
            return;

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return;

        var rawToken = GeneratePasswordResetToken();
        user.PasswordResetTokenHash = ComputeSha256(rawToken);
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.Add(PasswordResetTokenLifetime);
        await _dbContext.SaveChangesAsync();

        var encodedToken = Uri.EscapeDataString(rawToken);
        var resetUrl = $"{_passwordResetBaseUrl}?token={encodedToken}";
        var message = new MailgunMessage(
            To: user.Email,
            Subject: "Tenapp Core password reset",
            Text: $"Use this link to reset your password: {resetUrl}\nThe link expires in 1 hour.");

        try
        {
            await _mailgunService.SendSimpleMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email for user {UserId}", user.Id);
        }
    }

    public async Task<AuthResult<string>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
            return AuthResult<string>.Fail(StatusCodes.Status400BadRequest, "email, token and newPassword are required");

        var email = NormalizeEmail(dto.Email);
        if (!IsValidEmail(email))
            return AuthResult<string>.Fail(StatusCodes.Status400BadRequest, "Invalid email format");

        if (dto.NewPassword.Length < 6)
            return AuthResult<string>.Fail(StatusCodes.Status400BadRequest, "Password must be at least 6 characters long");

        var tokenHash = ComputeSha256(dto.Token.Trim());
        var now = DateTime.UtcNow;
        var user = await _dbContext.Users.FirstOrDefaultAsync(u =>
            u.Email == email &&
            u.PasswordResetTokenHash == tokenHash &&
            u.PasswordResetTokenExpiresAt != null &&
            u.PasswordResetTokenExpiresAt > now);

        if (user == null)
            return AuthResult<string>.Fail(StatusCodes.Status400BadRequest, "Invalid or expired reset token");

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;
        user.RefreshToken = null;
        await _dbContext.SaveChangesAsync();

        return AuthResult<string>.Ok("Password reset successful");
    }

    public async Task LogoutAsync(HttpRequest request, HttpResponse response)
    {
        if (request.Cookies.TryGetValue(RefreshCookieName, out var refreshToken) && !string.IsNullOrWhiteSpace(refreshToken))
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user != null)
            {
                user.RefreshToken = null;
                await _dbContext.SaveChangesAsync();
            }
        }

        DeleteAuthCookies(response, request);
    }

    public async Task<AuthResult<UserResponseDto>> MeAsync(ClaimsPrincipal principal)
    {
        if (!TryGetUserId(principal, out var userId))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid access token");

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "User not found");

        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    private async Task IssueTokensAsync(User user, HttpResponse response, HttpRequest? httpRequest)
    {
        var accessToken = GenerateToken(user.Id, tokenType: "access", expiresIn: TimeSpan.FromMinutes(30));
        var refreshToken = GenerateToken(user.Id, tokenType: "refresh", expiresIn: TimeSpan.FromDays(2));

        user.RefreshToken = refreshToken;
        await _dbContext.SaveChangesAsync();

        AppendCookie(response, httpRequest, AccessCookieName, accessToken, TimeSpan.FromMinutes(30));
        AppendCookie(response, httpRequest, RefreshCookieName, refreshToken, TimeSpan.FromDays(2));
    }

    private string GenerateToken(Guid userId, string tokenType, TimeSpan expiresIn)
    {
        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
        var now = DateTime.UtcNow;
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("token_type", tokenType)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            notBefore: now,
            expires: now.Add(expiresIn),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidateToken(string token, string expectedTokenType)
    {
        try
        {
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = _jwtIssuer,
                ValidAudience = _jwtAudience,
                IssuerSigningKey = _signingKey,
                ClockSkew = TimeSpan.Zero
            };

            var principal = new JwtSecurityTokenHandler().ValidateToken(token, validationParameters, out _);
            var tokenType = principal.FindFirstValue("token_type");

            return string.Equals(tokenType, expectedTokenType, StringComparison.Ordinal) ? principal : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate token");
            return null;
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
    {
        var subject =
            principal.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(subject, out userId);
    }

    private static void AppendCookie(HttpResponse response, HttpRequest? request, string cookieName, string value, TimeSpan expiresIn)
    {
        response.Cookies.Append(cookieName, value, new CookieOptions
        {
            HttpOnly = true,
            Secure = request?.IsHttps ?? false,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.Add(expiresIn)
        });
    }

    private static void DeleteAuthCookies(HttpResponse response, HttpRequest request)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        };

        response.Cookies.Delete(AccessCookieName, cookieOptions);
        response.Cookies.Delete(RefreshCookieName, cookieOptions);
    }

    private static UserResponseDto ToUserResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Login = user.Login,
            Email = user.Email,
            FirstName = user.FirstName,
            SecondName = user.SecondName
        };
    }

    private static string NormalizeEmail(string? email)
    {
        return email?.Trim().ToLowerInvariant() ?? string.Empty;
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string GeneratePasswordResetToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Base64UrlEncoder.Encode(bytes);
    }

    private static string ComputeSha256(string value)
    {
        var inputBytes = Encoding.UTF8.GetBytes(value);
        var hashBytes = SHA256.HashData(inputBytes);
        return Convert.ToHexString(hashBytes);
    }
}

