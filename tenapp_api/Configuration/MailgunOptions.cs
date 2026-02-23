namespace TenappCore.Configuration;

public sealed class MailgunOptions
{
    public const string SectionName = "Mailgun";

    public string BaseUrl { get; set; } = "https://api.mailgun.net";
    public string Domain { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Tenapp Core";
}
