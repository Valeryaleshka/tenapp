using Microsoft.Extensions.Logging;

namespace TenappCore.Infrastructure.Logging;

public class FileLoggerOptions
{
    public string Path { get; set; } = "logs/tenapp-log.txt";
    public LogLevel MinimumLevel { get; set; } = LogLevel.Information;
}
