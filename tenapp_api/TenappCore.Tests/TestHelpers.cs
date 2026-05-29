using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using TenappCore.Data;
using TenappCore.Models;
using TenappCore.Services;
using TenappCore.Services.Mailgun;

namespace TenappCore.Tests;

internal static class TestHelpers
{
    public static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    public static IConfiguration CreateConfiguration(params KeyValuePair<string, string?>[] values)
    {
        var defaults = new Dictionary<string, string?>
        {
            ["Jwt:Issuer"] = "tenapp-tests",
            ["Jwt:Audience"] = "tenapp-tests",
            ["Jwt:Key"] = "0123456789abcdef0123456789abcdef",
            ["Auth:PasswordResetBaseUrl"] = "https://ui.test/reset-password"
        };

        foreach (var value in values)
            defaults[value.Key] = value.Value;

        return new ConfigurationBuilder()
            .AddInMemoryCollection(defaults)
            .Build();
    }

    public static DefaultHttpContext CreateHttpContext(Guid? userId = null)
    {
        var context = new DefaultHttpContext();
        if (userId.HasValue)
            context.User = CreatePrincipal(userId.Value);

        return context;
    }

    public static ClaimsPrincipal CreatePrincipal(Guid userId)
    {
        return new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString())
            ],
            "TestAuth"));
    }

    public static User CreateUser(string email = "user@test.local")
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = "Test",
            SecondName = "User"
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, "correct-password");
        return user;
    }

    public static T ValueFromOk<T>(ActionResult<T> actionResult)
    {
        var ok = Assert.IsType<OkObjectResult>(actionResult.Result);
        return Assert.IsType<T>(ok.Value);
    }

    public static T ValueFromCreated<T>(ActionResult<T> actionResult)
    {
        var created = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        return Assert.IsType<T>(created.Value);
    }
}

internal sealed class FakeCurrentUserService : ICurrentUserService
{
    private readonly Guid? _userId;

    public FakeCurrentUserService(Guid? userId)
    {
        _userId = userId;
    }

    public bool TryGetUserId(out Guid userId)
    {
        userId = _userId ?? Guid.Empty;
        return _userId.HasValue;
    }
}

internal sealed class FakeCookieService : ICookieService
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public AuthCookieTokens TokensToGenerate { get; set; } = new("access-token", "refresh-token");
    public PasswordResetToken PasswordResetTokenToGenerate { get; set; } = new("reset-token", "RESET_HASH", DateTime.UtcNow.AddHours(1));
    public ClaimsPrincipal? RefreshPrincipal { get; set; }
    public bool AppendedAuthCookies { get; private set; }
    public bool DeletedAuthCookies { get; private set; }

    public string? GetAccessToken(HttpRequest request) => AccessToken;
    public string? GetRefreshToken(HttpRequest request) => RefreshToken;
    public AuthCookieTokens GenerateAuthTokens(Guid userId) => TokensToGenerate;
    public PasswordResetToken GeneratePasswordResetToken() => PasswordResetTokenToGenerate;
    public string ComputeTokenHash(string value) => $"HASH:{value}";
    public ClaimsPrincipal? ValidateRefreshToken(string token) => RefreshPrincipal;
    public void AppendAuthCookies(HttpResponse response, HttpRequest? request, AuthCookieTokens tokens) => AppendedAuthCookies = true;
    public void DeleteAuthCookies(HttpResponse response, HttpRequest request) => DeletedAuthCookies = true;
}

internal sealed class FakeEmailQueue : IEmailQueue
{
    public List<MailgunMessage> Messages { get; } = [];

    public void Enqueue(MailgunMessage message)
    {
        Messages.Add(message);
    }
}

internal sealed class FakeMailgunService : IMailgunService
{
    public List<MailgunMessage> Messages { get; } = [];
    public Exception? ExceptionToThrow { get; set; }

    public Task SendSimpleMessageAsync(MailgunMessage message, CancellationToken cancellationToken = default)
    {
        if (ExceptionToThrow != null)
            throw ExceptionToThrow;

        Messages.Add(message);
        return Task.CompletedTask;
    }
}

