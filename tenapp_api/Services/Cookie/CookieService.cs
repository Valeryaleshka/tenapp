using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TenappCore.Services;

public class CookieService : ICookieService
{
    private const string AccessCookieName = "accessToken";
    private const string RefreshCookieName = "refreshToken";
    private const string RefreshTokenType = "refresh";
    private const string AccessTokenType = "access";
    private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(2);
    private static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromHours(1);

    private readonly ILogger<CookieService> _logger;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    private readonly SymmetricSecurityKey _signingKey;

    public CookieService(IConfiguration configuration, ILogger<CookieService> logger)
    {
        _logger = logger;
        _jwtIssuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing");
        _jwtAudience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing");
        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing");
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    }

    public string? GetAccessToken(HttpRequest request)
    {
        return request.Cookies.TryGetValue(AccessCookieName, out var token) && !string.IsNullOrWhiteSpace(token)
            ? token
            : null;
    }

    public string? GetRefreshToken(HttpRequest request)
    {
        return request.Cookies.TryGetValue(RefreshCookieName, out var token) && !string.IsNullOrWhiteSpace(token)
            ? token
            : null;
    }

    public AuthCookieTokens GenerateAuthTokens(Guid userId)
    {
        return new AuthCookieTokens(
            GenerateToken(userId, AccessTokenType, AccessTokenLifetime),
            GenerateToken(userId, RefreshTokenType, RefreshTokenLifetime));
    }

    public PasswordResetToken GeneratePasswordResetToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var rawToken = Base64UrlEncoder.Encode(bytes);

        return new PasswordResetToken(
            rawToken,
            ComputeTokenHash(rawToken),
            DateTime.UtcNow.Add(PasswordResetTokenLifetime));
    }

    public string ComputeTokenHash(string value)
    {
        var inputBytes = Encoding.UTF8.GetBytes(value);
        var hashBytes = SHA256.HashData(inputBytes);
        return Convert.ToHexString(hashBytes);
    }

    public ClaimsPrincipal? ValidateRefreshToken(string token)
    {
        return ValidateToken(token, RefreshTokenType);
    }

    public void AppendAuthCookies(HttpResponse response, HttpRequest? request, AuthCookieTokens tokens)
    {
        AppendCookie(response, request, AccessCookieName, tokens.AccessToken, AccessTokenLifetime);
        AppendCookie(response, request, RefreshCookieName, tokens.RefreshToken, RefreshTokenLifetime);
    }

    public void DeleteAuthCookies(HttpResponse response, HttpRequest request)
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
}
