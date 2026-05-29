using System.Net.Mail;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TenappCore.Data;
using TenappCore.DTOs;
using TenappCore.Models;
using TenappCore.Services.Mailgun;
using TenappApi.Services;

namespace TenappCore.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IMailgunService _mailgunService;
    private readonly IEmailQueue _emailQueue;
    private readonly ICookieService _cookieService;
    private readonly ILogger<AuthService> _logger;
    private readonly string _passwordResetBaseUrl;

    public AuthService(
        AppDbContext dbContext,
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher,
        IMailgunService mailgunService,
        IEmailQueue emailQueue,
        ICookieService cookieService,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _mailgunService = mailgunService;
        _emailQueue = emailQueue;
        _cookieService = cookieService;
        _logger = logger;
        _passwordResetBaseUrl = configuration["Auth:PasswordResetBaseUrl"] ?? "http://localhost:3001/reset-password";
    }

    public async Task<AuthResult<UserResponseDto>> RegisterAsync(RegisterUserDto dto, HttpRequest request, HttpResponse response)
    {        
        var email = NormalizeService.NormalizeEmail(dto.Email);

        var exists = await _dbContext.Users.AnyAsync(u => u.Email == email);

        if (exists)
        {
          return AuthResult<UserResponseDto>.Fail(StatusCodes.Status409Conflict, "Email already exists");   
        }

        var user = new User {
            Email = email,
            FirstName = NormalizeService.NormalizeText(dto.FirstName),
            SecondName = NormalizeService.NormalizeText(dto.SecondName),
            PasswordHash = string.Empty
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("New user registered with email {Email}", user.Email);

        QueueWelcomeEmail(user);
        await IssueTokensAsync(user, response, request);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task<AuthResult<UserResponseDto>> LoginAsync(LoginUserDto dto, HttpRequest request, HttpResponse response)
    {
        if (string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.Email))
        {
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "password and email are required");
        }

        var email = NormalizeService.NormalizeEmail(dto.Email);
        var user =  await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials");

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials");

        await IssueTokensAsync(user, response, request);
        _logger.LogInformation("User logged in with email {Email}", user.Email);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task<AuthResult<UserResponseDto>> RefreshAsync(HttpRequest request, HttpResponse response)
    {
        var refreshToken = _cookieService.GetRefreshToken(request);
        if (refreshToken == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Refresh token is missing");

            
        var principal = _cookieService.ValidateRefreshToken(refreshToken);
        if (principal == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Expired or invalid refresh token");

        var refreshTokenHash = _cookieService.ComputeTokenHash(refreshToken);
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenHash);
        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid refresh token");

        if (!TryGetUserId(principal, out var subjectUserId) || subjectUserId != user.Id)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Refresh token subject mismatch");

        await IssueTokensAsync(user, response, request);
        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return;

        var email = NormalizeService.NormalizeEmail(dto.Email);

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return;

        var resetToken = _cookieService.GeneratePasswordResetToken();
        user.PasswordResetTokenHash = resetToken.Hash;
        user.PasswordResetTokenExpiresAt = resetToken.ExpiresAt;
        await _dbContext.SaveChangesAsync();

        var encodedToken = Uri.EscapeDataString(resetToken.RawToken);
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

    public async Task<AuthResult<UserResponseDto>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var email = NormalizeService.NormalizeEmail(dto.Email);

        var tokenHash = _cookieService.ComputeTokenHash(dto.Token.Trim());
        var now = DateTime.UtcNow;
        var user = await _dbContext.Users.FirstOrDefaultAsync(u =>
            u.Email == email &&
            u.PasswordResetTokenHash == tokenHash &&
            u.PasswordResetTokenExpiresAt != null &&
            u.PasswordResetTokenExpiresAt > now);

        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "Invalid or expired reset token");

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;
        user.RefreshToken = null;
        await _dbContext.SaveChangesAsync();

        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    public async Task LogoutAsync(HttpRequest request, HttpResponse response)
    {
        var refreshToken = _cookieService.GetRefreshToken(request);
        if (refreshToken != null)
        {
            var refreshTokenHash = _cookieService.ComputeTokenHash(refreshToken);
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenHash);
            if (user != null)
            {
                user.RefreshToken = null;
                await _dbContext.SaveChangesAsync();
            }
        }

        _cookieService.DeleteAuthCookies(response, request);
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

    public async Task<AuthResult<UserResponseDto>> UpdateAccountAsync(ClaimsPrincipal principal, UpdateAccountDto dto)
    {
        if (!TryGetUserId(principal, out var userId))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "Invalid access token");

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status401Unauthorized, "User not found");

        var email = NormalizeService.NormalizeEmail(dto.Email);
        if (string.IsNullOrWhiteSpace(email))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "email is required");

        var firstName = NormalizeService.NormalizeText(dto.FirstName);
        var secondName = NormalizeService.NormalizeText(dto.SecondName);

        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(secondName))
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "first name and last name are required");

        if (firstName.Length > 100 || secondName.Length > 100)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "first name and last name must be 100 characters or less");

        var emailExists = await _dbContext.Users.AnyAsync(u => u.Id != userId && u.Email == email);
        if (emailExists)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status409Conflict, "Email already exists");

        var phoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
            ? null
            : dto.PhoneNumber.Trim();

        if (phoneNumber?.Length > 30)
            return AuthResult<UserResponseDto>.Fail(StatusCodes.Status400BadRequest, "phone number must be 30 characters or less");

        user.Email = email;
        user.FirstName = firstName;
        user.SecondName = secondName;
        user.PhoneNumber = phoneNumber;
        await _dbContext.SaveChangesAsync();

        return AuthResult<UserResponseDto>.Ok(ToUserResponse(user));
    }

    private async Task IssueTokensAsync(User user, HttpResponse response, HttpRequest? httpRequest)
    {
        var tokens = _cookieService.GenerateAuthTokens(user.Id);

        user.RefreshToken = _cookieService.ComputeTokenHash(tokens.RefreshToken);
        await _dbContext.SaveChangesAsync();

        _cookieService.AppendAuthCookies(response, httpRequest, tokens);
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
    {
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(subject, out userId);
    }

    private static UserResponseDto ToUserResponse(User user)
    {
        return new UserResponseDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            SecondName = user.SecondName,
            PhoneNumber = user.PhoneNumber
        };
    }


    private void QueueWelcomeEmail(User user)
    {
        var message = new MailgunMessage(
            To: user.Email,
            Subject: "Welcome to Tenapp Core",
            Text: $"Hello {user.FirstName}, welcome to Tenapp Core.");

        _emailQueue.Enqueue(message);
    }
}

