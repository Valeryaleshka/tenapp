using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TenappCore.DTOs;
using TenappCore.Services;

namespace TenappCore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(RegisterUserDto dto)
    {
        var result = await _authService.RegisterAsync(dto, Request, Response);
        return ToActionResult(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login(LoginUserDto dto)
    {
        var result = await _authService.LoginAsync(dto, Request, Response);
        return ToActionResult(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<UserResponseDto>> Refresh()
    {
        var result = await _authService.RefreshAsync(Request, Response);
        return ToActionResult(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("email is required");

        await _authService.ForgotPasswordAsync(dto);
        return Ok("If account exists, reset instructions were sent");
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<UserResponseDto>> ResetPassword(ResetPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto);
        return ToActionResult(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync(Request, Response);
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDto>> Me()
    {
        var result = await _authService.MeAsync(User);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPut("account")]
    public async Task<ActionResult<UserResponseDto>> UpdateAccount(UpdateAccountDto dto)
    {
        var result = await _authService.UpdateAccountAsync(User, dto);
        return ToActionResult(result);
    }

    private ActionResult<UserResponseDto> ToActionResult(AuthResult<UserResponseDto> result)
    {
        if (result.Success)
            return Ok(result.Data);

        return result.StatusCode switch
        {
            StatusCodes.Status400BadRequest => BadRequest(result.Error),
            StatusCodes.Status401Unauthorized => Unauthorized(result.Error),
            StatusCodes.Status409Conflict => Conflict(result.Error),
            _ => StatusCode(result.StatusCode, result.Error)
        };
    }
}

