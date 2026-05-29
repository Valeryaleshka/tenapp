using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TenappCore.Services;

namespace TenappCore.Tests.Services;

public class CurrentUserServiceTests
{
    [Fact]
    public void TryGetUserId_ReadsJwtSubjectClaim()
    {
        var expectedUserId = Guid.NewGuid();
        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(JwtRegisteredClaimNames.Sub, expectedUserId.ToString())],
                    "TestAuth"))
            }
        };

        var service = new CurrentUserService(accessor);

        Assert.True(service.TryGetUserId(out var userId));
        Assert.Equal(expectedUserId, userId);
    }

    [Fact]
    public void TryGetUserId_ReturnsFalseWhenClaimIsMissing()
    {
        var service = new CurrentUserService(new HttpContextAccessor { HttpContext = new DefaultHttpContext() });

        Assert.False(service.TryGetUserId(out var userId));
        Assert.Equal(Guid.Empty, userId);
    }
}

