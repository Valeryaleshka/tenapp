using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TenappCore.Services;

namespace TenappCore.Tests.Services;

public class CookieServiceTests
{
    [Fact]
    public void GenerateAuthTokens_CreatesRefreshTokenThatValidates()
    {
        var userId = Guid.NewGuid();
        var service = CreateService();

        var tokens = service.GenerateAuthTokens(userId);
        var principal = service.ValidateRefreshToken(tokens.RefreshToken);

        Assert.False(string.IsNullOrWhiteSpace(tokens.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(tokens.RefreshToken));
        Assert.Equal(userId.ToString(), principal?.FindFirstValue(ClaimTypes.NameIdentifier));
    }

    [Fact]
    public void ValidateRefreshToken_RejectsAccessToken()
    {
        var service = CreateService();
        var tokens = service.GenerateAuthTokens(Guid.NewGuid());

        Assert.Null(service.ValidateRefreshToken(tokens.AccessToken));
    }

    [Fact]
    public void ComputeTokenHash_IsStableSha256Hex()
    {
        var service = CreateService();

        var hash = service.ComputeTokenHash("token");

        Assert.Equal(hash, service.ComputeTokenHash("token"));
        Assert.Equal(64, hash.Length);
    }

    [Fact]
    public void GetTokenMethods_ReturnNullForMissingOrBlankCookies()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers.Cookie = "accessToken=; refreshToken=refresh";
        var service = CreateService();

        Assert.Null(service.GetAccessToken(context.Request));
        Assert.Equal("refresh", service.GetRefreshToken(context.Request));
    }

    [Fact]
    public void AppendAndDeleteAuthCookies_WriteCookieHeaders()
    {
        var context = new DefaultHttpContext();
        context.Request.Scheme = "https";
        var service = CreateService();

        service.AppendAuthCookies(context.Response, context.Request, new AuthCookieTokens("access", "refresh"));
        service.DeleteAuthCookies(context.Response, context.Request);

        var setCookieHeaders = context.Response.Headers.SetCookie.ToString();
        Assert.Contains("accessToken=", setCookieHeaders);
        Assert.Contains("refreshToken=", setCookieHeaders);
        Assert.Contains("httponly", setCookieHeaders, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", setCookieHeaders, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Constructor_RequiresJwtConfiguration()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            new CookieService(TestHelpers.CreateConfiguration(new KeyValuePair<string, string?>("Jwt:Key", null)), NullLogger<CookieService>.Instance));

        Assert.Equal("Jwt:Key is missing", ex.Message);
    }

    private static CookieService CreateService()
    {
        return new CookieService(TestHelpers.CreateConfiguration(), NullLogger<CookieService>.Instance);
    }
}

