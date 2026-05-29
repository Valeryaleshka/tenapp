using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenappCore.Controllers;
using TenappCore.DTOs;
using TenappCore.Services;

namespace TenappCore.Tests.Controllers;

public class AuthControllerTests
{
    [Theory]
    [InlineData(StatusCodes.Status400BadRequest, typeof(BadRequestObjectResult))]
    [InlineData(StatusCodes.Status401Unauthorized, typeof(UnauthorizedObjectResult))]
    [InlineData(StatusCodes.Status409Conflict, typeof(ConflictObjectResult))]
    [InlineData(StatusCodes.Status500InternalServerError, typeof(ObjectResult))]
    public async Task Login_MapsAuthServiceFailuresToHttpResults(int statusCode, Type expectedResultType)
    {
        var authService = new FakeAuthService
        {
            NextUserResult = AuthResult<UserResponseDto>.Fail(statusCode, "error")
        };
        var controller = CreateController(authService);

        var result = await controller.Login(new LoginUserDto { Email = "user@test.local", Password = "password" });

        Assert.IsType(expectedResultType, result.Result);
        if (result.Result is ObjectResult objectResult)
            Assert.Equal(statusCode, objectResult.StatusCode);
    }

    [Fact]
    public async Task Register_ReturnsOkWithUserPayload()
    {
        var authService = new FakeAuthService
        {
            NextUserResult = AuthResult<UserResponseDto>.Ok(new UserResponseDto { Email = "user@test.local" })
        };
        var controller = CreateController(authService);

        var result = await controller.Register(new RegisterUserDto());

        Assert.Equal("user@test.local", TestHelpers.ValueFromOk(result).Email);
    }

    [Fact]
    public async Task ForgotPassword_RequiresEmailBeforeCallingService()
    {
        var authService = new FakeAuthService();
        var controller = CreateController(authService);

        var result = await controller.ForgotPassword(new ForgotPasswordDto { Email = " " });

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.False(authService.ForgotPasswordCalled);
    }

    [Fact]
    public async Task Logout_CallsServiceAndReturnsOk()
    {
        var authService = new FakeAuthService();
        var controller = CreateController(authService);

        var result = await controller.Logout();

        Assert.True(authService.LogoutCalled);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task Me_AndUpdateAccount_ReturnMappedResults()
    {
        var authService = new FakeAuthService
        {
            NextUserResult = AuthResult<UserResponseDto>.Ok(new UserResponseDto { Email = "me@test.local" })
        };
        var controller = CreateController(authService, Guid.NewGuid());

        var me = await controller.Me();
        var account = await controller.UpdateAccount(new UpdateAccountDto
        {
            Email = "me@test.local",
            FirstName = "Me",
            SecondName = "User"
        });

        Assert.Equal("me@test.local", TestHelpers.ValueFromOk(me).Email);
        Assert.Equal("me@test.local", TestHelpers.ValueFromOk(account).Email);
    }

    private static AuthController CreateController(FakeAuthService authService, Guid? userId = null)
    {
        var context = TestHelpers.CreateHttpContext(userId);
        return new AuthController(authService)
        {
            ControllerContext = new ControllerContext { HttpContext = context }
        };
    }

    private sealed class FakeAuthService : IAuthService
    {
        public AuthResult<UserResponseDto> NextUserResult { get; set; } = AuthResult<UserResponseDto>.Ok(new UserResponseDto());
        public bool ForgotPasswordCalled { get; private set; }
        public bool LogoutCalled { get; private set; }

        public Task<AuthResult<UserResponseDto>> RegisterAsync(RegisterUserDto dto, HttpRequest request, HttpResponse response) => Task.FromResult(NextUserResult);
        public Task<AuthResult<UserResponseDto>> LoginAsync(LoginUserDto dto, HttpRequest request, HttpResponse response) => Task.FromResult(NextUserResult);
        public Task<AuthResult<UserResponseDto>> RefreshAsync(HttpRequest request, HttpResponse response) => Task.FromResult(NextUserResult);
        public Task<AuthResult<UserResponseDto>> ResetPasswordAsync(ResetPasswordDto dto) => Task.FromResult(NextUserResult);
        public Task<AuthResult<UserResponseDto>> MeAsync(ClaimsPrincipal principal) => Task.FromResult(NextUserResult);
        public Task<AuthResult<UserResponseDto>> UpdateAccountAsync(ClaimsPrincipal principal, UpdateAccountDto dto) => Task.FromResult(NextUserResult);

        public Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            ForgotPasswordCalled = true;
            return Task.CompletedTask;
        }

        public Task LogoutAsync(HttpRequest request, HttpResponse response)
        {
            LogoutCalled = true;
            return Task.CompletedTask;
        }
    }
}

