using Microsoft.Extensions.Logging;

namespace TenappCore.Infrastructure.Logging;

public static class FileLoggerExtensions
{
    public static ILoggingBuilder AddFile(this ILoggingBuilder builder, IConfiguration configuration, string contentRootPath)
    {
        var options = configuration.Get<FileLoggerOptions>() ?? new FileLoggerOptions();
        if (!System.IO.Path.IsPathRooted(options.Path))
        {
            options.Path = System.IO.Path.Combine(contentRootPath, options.Path);
        }

        builder.AddProvider(new FileLoggerProvider(options));
        return builder;
    }
}
