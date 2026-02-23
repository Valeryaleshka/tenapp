using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TenappCore.DTOs;

namespace TenappCore.Services;

public interface IAuthService
{
    Task<AuthResult<UserResponseDto>> RegisterAsync(RegisterUserDto dto, HttpResponse response);
    Task<AuthResult<UserResponseDto>> LoginAsync(LoginUserDto dto, HttpResponse response);
    Task<AuthResult<UserResponseDto>> RefreshAsync(HttpRequest request, HttpResponse response);
    Task ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<AuthResult<string>> ResetPasswordAsync(ResetPasswordDto dto);
    Task LogoutAsync(HttpRequest request, HttpResponse response);
    Task<AuthResult<UserResponseDto>> MeAsync(ClaimsPrincipal principal);
}

