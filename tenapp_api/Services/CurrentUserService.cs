using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TenappCore.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool TryGetUserId(out Guid userId)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var subject =
            user?.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            user?.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(subject, out userId);
    }
}
