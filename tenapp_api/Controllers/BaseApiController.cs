using TenappCore.Services;
using Microsoft.AspNetCore.Mvc;
using TenappCore.DTOs;

namespace TenappCore.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult<UserResponseDto> ToActionResult(AuthResult<UserResponseDto> result)
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

    protected IActionResult ToMessageActionResult(AuthResult<string> result)
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