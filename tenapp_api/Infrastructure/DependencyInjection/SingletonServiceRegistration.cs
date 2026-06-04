using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using TenappCore.Configuration;
using TenappCore.Services.Mailgun;
using TenappCore.Services.Storage.helpers;

namespace TenappCore.Infrastructure.DependencyInjection;

public static class SingletonServiceRegistration
{
    public static IServiceCollection AddSingletonServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAmazonS3>(_ =>
        {
            var options = configuration.GetSection(S3Options.SectionName).Get<S3Options>() ?? new S3Options();
            var regionName = string.IsNullOrWhiteSpace(options.Region) ? "us-east-1" : options.Region;
            var region = RegionEndpoint.GetBySystemName(regionName);

            if (!string.IsNullOrWhiteSpace(options.AccessKeyId) &&
                !string.IsNullOrWhiteSpace(options.SecretAccessKey))
            {
                return new AmazonS3Client(
                    new BasicAWSCredentials(options.AccessKeyId, options.SecretAccessKey),
                    region);
            }

            return new AmazonS3Client(region);
        });

        services.AddSingleton<IS3UrlBuilder, S3UrlBuilder>();
        services.AddSingleton<EmailQueue>();
        services.AddSingleton<IEmailQueue>(provider => provider.GetRequiredService<EmailQueue>());
        services.AddHostedService(provider => provider.GetRequiredService<EmailQueue>());

        return services;
    }
}
