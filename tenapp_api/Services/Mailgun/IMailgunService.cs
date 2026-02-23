namespace TenappCore.Services.Mailgun;

public interface IMailgunService
{
    Task SendSimpleMessageAsync(MailgunMessage message, CancellationToken cancellationToken = default);
}
