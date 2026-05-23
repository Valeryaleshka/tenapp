using System.Threading.Channels;

namespace TenappCore.Services.Mailgun;

public sealed class EmailQueue : BackgroundService, IEmailQueue
{
    private readonly Channel<MailgunMessage> _queue = Channel.CreateUnbounded<MailgunMessage>();
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailQueue> _logger;

    public EmailQueue(IServiceScopeFactory scopeFactory, ILogger<EmailQueue> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public void Enqueue(MailgunMessage message)
    {
        if (!_queue.Writer.TryWrite(message))
        {
            _logger.LogWarning("Failed to queue email message to {Recipient}", message.To);
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var message in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var mailgunService = scope.ServiceProvider.GetRequiredService<IMailgunService>();

                await mailgunService.SendSimpleMessageAsync(message, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send queued email message to {Recipient}", message.To);
            }
        }
    }
}

