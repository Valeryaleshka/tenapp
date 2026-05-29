using TenappApi.Services;

namespace TenappCore.Tests.Services;

public class NormalizeServiceTests
{
    [Fact]
    public void NormalizeEmail_TrimsAndLowercases()
    {
        Assert.Equal("user@example.com", NormalizeService.NormalizeEmail("  USER@Example.COM  "));
    }

    [Fact]
    public void NormalizeText_TrimsAndConvertsNullToEmpty()
    {
        Assert.Equal("Jane", NormalizeService.NormalizeText("  Jane  "));
        Assert.Equal(string.Empty, NormalizeService.NormalizeText(null!));
    }
}

