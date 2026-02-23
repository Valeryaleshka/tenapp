namespace TenappCore.Services.Mailgun;

public sealed record MailgunMessage(string To, string Subject, string Text);
