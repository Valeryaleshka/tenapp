using Microsoft.Extensions.Options;
using TenappCore.Configuration;
using RestSharp;
using RestSharp.Authenticators;

namespace TenappCore.Services.Mailgun;

public sealed class MailgunService : IMailgunService
{
    private readonly MailgunOptions _options;

    public MailgunService(IOptions<MailgunOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendSimpleMessageAsync(MailgunMessage message, CancellationToken cancellationToken = default)
    {
        ValidateConfiguration();

        var clientOptions = new RestClientOptions(_options.BaseUrl)
        {
            Authenticator = new HttpBasicAuthenticator("api", _options.ApiKey)
        };

        using var client = new RestClient(clientOptions);
        var request = new RestRequest($"/v3/{_options.Domain}/messages", Method.Post)
        {
            AlwaysMultipartFormData = true
        };

        request.AddParameter("from", $"{_options.FromName} <{_options.FromEmail}>");
        request.AddParameter("to", message.To);
        request.AddParameter("subject", message.Subject);
        request.AddParameter("text", message.Text);

        var response = await client.ExecuteAsync(request, cancellationToken);
        if (!response.IsSuccessful)
        {
            var statusCode = (int?)response.StatusCode;
            var body = response.Content ?? string.Empty;
            throw new InvalidOperationException($"Mailgun request failed. StatusCode={statusCode}, Error={body}");
        }
    }

    private void ValidateConfiguration()
    {
        if (string.IsNullOrWhiteSpace(_options.Domain))
        {
            throw new InvalidOperationException("Mailgun:Domain is missing.");
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Mailgun:ApiKey is missing. Configure it in appsettings.Local.json or environment variable Mailgun__ApiKey.");
        }

        if (string.IsNullOrWhiteSpace(_options.FromEmail))
        {
            throw new InvalidOperationException("Mailgun:FromEmail is missing.");
        }
    }
}
