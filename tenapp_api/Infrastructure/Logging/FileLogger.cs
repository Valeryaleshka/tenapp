using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace TenappCore.Infrastructure.Logging;

public sealed class FileLogger : ILogger
{
    private readonly string _categoryName;
    private readonly FileLoggerProvider _provider;

    public FileLogger(string categoryName, FileLoggerProvider provider)
    {
        _categoryName = categoryName;
        _provider = provider;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return NullScope.Instance;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logLevel != LogLevel.None && logLevel >= _provider.Options.MinimumLevel;
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        ArgumentNullException.ThrowIfNull(formatter);

        var message = formatter(state, exception);
        if (string.IsNullOrWhiteSpace(message) && exception == null)
        {
            return;
        }

        var timestamp = DateTimeOffset.UtcNow.ToString("O");
        var processId = Environment.ProcessId;
        var threadId = Environment.CurrentManagedThreadId;
        var eventPart = eventId.Id == 0 ? string.Empty : $" EventId={eventId.Id}";
        var traceId = Activity.Current?.TraceId.ToString();
        var tracePart = string.IsNullOrWhiteSpace(traceId) ? string.Empty : $" TraceId={traceId}";
        var exceptionPart = exception == null ? string.Empty : $"{Environment.NewLine}{exception}";

        _provider.WriteLine(
            $"{timestamp} [{logLevel}] {_categoryName}{eventPart}{tracePart} Process={processId} Thread={threadId}: {message}{exceptionPart}");
    }

    private sealed class NullScope : IDisposable
    {
        public static readonly NullScope Instance = new();

        private NullScope()
        {
        }

        public void Dispose()
        {
        }
    }
}
