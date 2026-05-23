namespace TenappCore.Services.Mailgun;

public interface IEmailQueue
{
    void Enqueue(MailgunMessage message);
}

