using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using TenappCore.Services.Mailgun;

namespace TenappCore.Tests.Services;

public class EmailQueueTests
{
    [Fact]
    public void Enqueue_AcceptsMessages()
    {
        var services = new ServiceCollection()
            .AddScoped<IMailgunService, FakeMailgunService>()
            .BuildServiceProvider();
        var queue = new EmailQueue(services.GetRequiredService<IServiceScopeFactory>(), NullLogger<EmailQueue>.Instance);

        queue.Enqueue(new MailgunMessage("to@test.local", "Subject", "Text"));
    }
}

