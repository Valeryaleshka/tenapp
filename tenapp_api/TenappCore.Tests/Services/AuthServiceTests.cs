using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TenappCore.DTOs;
using TenappCore.Models;
using TenappCore.Services;
using Xunit;

namespace TenappCore.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_CreatesNormalizedUserQueuesEmailAndIssuesCookies()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var cookieService = new FakeCookieService();
        var emailQueue = new FakeEmailQueue();
        var service = CreateService(dbContext, cookieService: cookieService, emailQueue: emailQueue);
        var httpContext = TestHelpers.CreateHttpContext();

        var result = await service.RegisterAsync(
            new RegisterUserDto
            {
                Email = "  USER@Example.COM ",
                Password = "password123",
                FirstName = " Jane ",
                SecondName = " Doe "
            },
            httpContext.Request,
            httpContext.Response);

        Assert.True(result.Success);
        Assert.Equal("user@example.com", result.Data?.Email);
        Assert.Equal("Jane", result.Data?.FirstName);
        Assert.Equal("Doe", result.Data?.SecondName);
        var user = Assert.Single(dbContext.Users);
        Assert.Equal("HASH:refresh-token", user.RefreshToken);
        var message = Assert.Single(emailQueue.Messages);
        Assert.Equal("user@example.com", message.To);
        Assert.Equal("Welcome to Tenapp Core", message.Subject);
        Assert.Equal("Hello Jane, welcome to Tenapp Core.", message.Text);
        Assert.True(cookieService.AppendedAuthCookies);
    }

    [Fact]
    public async Task RegisterAsync_ReturnsConflictWhenEmailAlreadyExists()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        dbContext.Users.Add(TestHelpers.CreateUser("user@example.com"));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);
        var httpContext = TestHelpers.CreateHttpContext();

        var result = await service.RegisterAsync(
            new RegisterUserDto
            {
                Email = "USER@example.com",
                Password = "password123",
                FirstName = "Jane",
                SecondName = "Doe"
            },
            httpContext.Request,
            httpContext.Response);

        Assert.False(result.Success);
        Assert.Equal(StatusCodes.Status409Conflict, result.StatusCode);
    }

    [Fact]
    public async Task LoginAsync_RejectsMissingCredentialsAndInvalidPassword()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        dbContext.Users.Add(TestHelpers.CreateUser("user@example.com"));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);
        var httpContext = TestHelpers.CreateHttpContext();

        var missing = await service.LoginAsync(new LoginUserDto { Email = "", Password = "" }, httpContext.Request, httpContext.Response);
        var invalid = await service.LoginAsync(new LoginUserDto { Email = "user@example.com", Password = "bad" }, httpContext.Request, httpContext.Response);

        Assert.Equal(StatusCodes.Status400BadRequest, missing.StatusCode);
        Assert.Equal(StatusCodes.Status401Unauthorized, invalid.StatusCode);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentialsIssuesCookies()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        dbContext.Users.Add(TestHelpers.CreateUser("user@example.com"));
        await dbContext.SaveChangesAsync();
        var cookieService = new FakeCookieService();
        var service = CreateService(dbContext, cookieService: cookieService);
        var httpContext = TestHelpers.CreateHttpContext();

        var result = await service.LoginAsync(
            new LoginUserDto { Email = " USER@example.com ", Password = "correct-password" },
            httpContext.Request,
            httpContext.Response);

        Assert.True(result.Success);
        Assert.True(cookieService.AppendedAuthCookies);
        Assert.Equal("HASH:refresh-token", Assert.Single(dbContext.Users).RefreshToken);
    }

    [Fact]
    public async Task RefreshAsync_ValidatesCookieHashAndSubject()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        user.RefreshToken = "HASH:raw-refresh";
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var cookieService = new FakeCookieService
        {
            RefreshToken = "raw-refresh",
            RefreshPrincipal = TestHelpers.CreatePrincipal(user.Id)
        };
        var service = CreateService(dbContext, cookieService: cookieService);
        var httpContext = TestHelpers.CreateHttpContext();

        var result = await service.RefreshAsync(httpContext.Request, httpContext.Response);

        Assert.True(result.Success);
        Assert.True(cookieService.AppendedAuthCookies);
    }

    [Fact]
    public async Task RefreshAsync_RejectsMissingOrMismatchedToken()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var service = CreateService(dbContext, cookieService: new FakeCookieService());
        var httpContext = TestHelpers.CreateHttpContext();

        var missing = await service.RefreshAsync(httpContext.Request, httpContext.Response);

        Assert.False(missing.Success);
        Assert.Equal(StatusCodes.Status401Unauthorized, missing.StatusCode);
    }

    [Fact]
    public async Task ForgotPasswordAsync_SetsTokenAndSendsEmailForExistingUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var mailgun = new FakeMailgunService();
        var service = CreateService(dbContext, mailgunService: mailgun);

        await service.ForgotPasswordAsync(new ForgotPasswordDto { Email = " USER@example.com " });

        Assert.Equal("RESET_HASH", user.PasswordResetTokenHash);
        Assert.NotNull(user.PasswordResetTokenExpiresAt);
        var message = Assert.Single(mailgun.Messages);
        Assert.Equal("user@example.com", message.To);
        Assert.Equal("Tenapp Core password reset", message.Subject);
        Assert.Contains("token=reset-token", message.Text);
        Assert.Contains("The link expires in 1 hour.", message.Text);
    }

    [Fact]
    public async Task ForgotPasswordAsync_DoesNotThrowWhenEmailSendFails()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        dbContext.Users.Add(TestHelpers.CreateUser("user@example.com"));
        await dbContext.SaveChangesAsync();
        var mailgun = new FakeMailgunService { ExceptionToThrow = new InvalidOperationException("send failed") };
        var service = CreateService(dbContext, mailgunService: mailgun);

        await service.ForgotPasswordAsync(new ForgotPasswordDto { Email = "user@example.com" });
    }

    [Fact]
    public async Task ResetPasswordAsync_UpdatesPasswordAndClearsResetState()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        user.PasswordResetTokenHash = "HASH:raw-reset";
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);
        user.RefreshToken = "HASH:old-refresh";
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);

        var result = await service.ResetPasswordAsync(new ResetPasswordDto
        {
            Email = "user@example.com",
            Token = " raw-reset ",
            NewPassword = "new-password"
        });

        Assert.True(result.Success);
        Assert.Null(user.PasswordResetTokenHash);
        Assert.Null(user.PasswordResetTokenExpiresAt);
        Assert.Null(user.RefreshToken);
        Assert.NotEqual(PasswordVerificationResult.Failed, new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, "new-password"));
    }

    [Fact]
    public async Task MeAsync_ReturnsUserOrUnauthorized()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);

        var ok = await service.MeAsync(TestHelpers.CreatePrincipal(user.Id));
        var invalid = await service.MeAsync(new System.Security.Claims.ClaimsPrincipal());

        Assert.True(ok.Success);
        Assert.Equal("user@example.com", ok.Data?.Email);
        Assert.Equal(StatusCodes.Status401Unauthorized, invalid.StatusCode);
    }

    [Fact]
    public async Task UpdateAccountAsync_ValidatesAndPersistsAccount()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        dbContext.Users.Add(user);
        dbContext.Users.Add(TestHelpers.CreateUser("taken@example.com"));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);

        var conflict = await service.UpdateAccountAsync(TestHelpers.CreatePrincipal(user.Id), new UpdateAccountDto
        {
            Email = "taken@example.com",
            FirstName = "Jane",
            SecondName = "Doe"
        });
        var ok = await service.UpdateAccountAsync(TestHelpers.CreatePrincipal(user.Id), new UpdateAccountDto
        {
            Email = " NEW@example.com ",
            FirstName = " Jane ",
            SecondName = " Doe ",
            PhoneNumber = " 555 "
        });

        Assert.Equal(StatusCodes.Status409Conflict, conflict.StatusCode);
        Assert.True(ok.Success);
        Assert.Equal("new@example.com", user.Email);
        Assert.Equal("555", user.PhoneNumber);
    }

    [Fact]
    public async Task UploadLogoAsync_UploadsLogoAndPersistsUrl()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var storageService = new FakeS3ObjectStorageService();
        var service = CreateService(dbContext, storageService: storageService);
        var file = TestHelpers.CreateFormFile("logo.png", "image/png");

        var result = await service.UploadLogoAsync(TestHelpers.CreatePrincipal(user.Id), file);

        Assert.True(result.Success);
        Assert.True(storageService.UploadCalled);
        Assert.Equal("https://cdn.test/user-logos/logo.png", user.LogoUrl);
        Assert.Equal(user.LogoUrl, result.Data?.LogoUrl);
    }

    [Fact]
    public async Task UploadLogoAsync_RejectsInvalidPrincipalAndStorageValidation()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var storageService = new FakeS3ObjectStorageService
        {
            ExceptionToThrow = new ArgumentException("logo file must be a jpeg, png, webp, or gif image")
        };
        var service = CreateService(dbContext, storageService: storageService);

        var unauthorized = await service.UploadLogoAsync(new System.Security.Claims.ClaimsPrincipal(), TestHelpers.CreateFormFile());
        var invalidFile = await service.UploadLogoAsync(TestHelpers.CreatePrincipal(user.Id), TestHelpers.CreateFormFile());

        Assert.Equal(StatusCodes.Status401Unauthorized, unauthorized.StatusCode);
        Assert.Equal(StatusCodes.Status400BadRequest, invalidFile.StatusCode);
    }

    [Fact]
    public async Task LogoutAsync_ClearsStoredRefreshTokenAndDeletesCookies()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var user = TestHelpers.CreateUser("user@example.com");
        user.RefreshToken = "HASH:raw-refresh";
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        var cookieService = new FakeCookieService { RefreshToken = "raw-refresh" };
        var service = CreateService(dbContext, cookieService: cookieService);
        var httpContext = TestHelpers.CreateHttpContext();

        await service.LogoutAsync(httpContext.Request, httpContext.Response);

        Assert.Null(user.RefreshToken);
        Assert.True(cookieService.DeletedAuthCookies);
    }

    private static AuthService CreateService(
        TenappCore.Data.AppDbContext dbContext,
        FakeCookieService? cookieService = null,
        FakeEmailQueue? emailQueue = null,
        FakeMailgunService? mailgunService = null,
        FakeS3ObjectStorageService? storageService = null)
    {
        return new AuthService(
            dbContext,
            TestHelpers.CreateConfiguration(),
            new PasswordHasher<User>(),
            mailgunService ?? new FakeMailgunService(),
            emailQueue ?? new FakeEmailQueue(),
            cookieService ?? new FakeCookieService(),
            storageService ?? new FakeS3ObjectStorageService(),
            NullLogger<AuthService>.Instance);
    }
}
