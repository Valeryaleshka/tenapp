using Microsoft.Extensions.Options;
using TenappCore.Configuration;
using TenappCore.Services.Mailgun;

namespace TenappCore.Tests.Services;

public class MailgunServiceTests
{
    [Theory]
    [InlineData("", "key", "from@test.local", "Mailgun:Domain is missing.")]
    [InlineData("mg.test.local", "", "from@test.local", "Mailgun:ApiKey is missing. Configure it in appsettings.Local.json or environment variable Mailgun__ApiKey.")]
    [InlineData("mg.test.local", "key", "", "Mailgun:FromEmail is missing.")]
    public async Task SendSimpleMessageAsync_ValidatesRequiredConfiguration(
        string domain,
        string apiKey,
        string fromEmail,
        string expectedMessage)
    {
        var service = new MailgunService(Options.Create(new MailgunOptions
        {
            BaseUrl = "https://api.mailgun.test",
            Domain = domain,
            ApiKey = apiKey,
            FromEmail = fromEmail,
            FromName = "Tenapp"
        }));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SendSimpleMessageAsync(new MailgunMessage("to@test.local", "Subject", "Text")));

        Assert.Equal(expectedMessage, ex.Message);
    }
}

