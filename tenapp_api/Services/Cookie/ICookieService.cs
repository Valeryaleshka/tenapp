using System.Security.Claims;

namespace TenappCore.Services;

public interface ICookieService
{
    string? GetAccessToken(HttpRequest request);
    string? GetRefreshToken(HttpRequest request);
    AuthCookieTokens GenerateAuthTokens(Guid userId);
    PasswordResetToken GeneratePasswordResetToken();
    string ComputeTokenHash(string value);
    ClaimsPrincipal? ValidateRefreshToken(string token);
    void AppendAuthCookies(HttpResponse response, HttpRequest? request, AuthCookieTokens tokens);
    void DeleteAuthCookies(HttpResponse response, HttpRequest request);
}
