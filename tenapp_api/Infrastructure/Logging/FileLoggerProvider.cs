using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace TenappCore.Infrastructure.Logging;

public sealed class FileLoggerProvider : ILoggerProvider
{
    private readonly ConcurrentDictionary<string, FileLogger> _loggers = new(StringComparer.OrdinalIgnoreCase);
    private readonly Lock _lock = new();
    private readonly StreamWriter _writer;
    private bool _disposed;

    public FileLoggerProvider(FileLoggerOptions options)
    {
        Options = options;

        var directory = System.IO.Path.GetDirectoryName(options.Path);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var stream = new FileStream(options.Path, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
        _writer = new StreamWriter(stream) { AutoFlush = true };
    }

    public FileLoggerOptions Options { get; }

    public ILogger CreateLogger(string categoryName)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        return _loggers.GetOrAdd(categoryName, name => new FileLogger(name, this));
    }

    public void WriteLine(string line)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        lock (_lock)
        {
            _writer.WriteLine(line);
        }
    }

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        lock (_lock)
        {
            _writer.Dispose();
            _disposed = true;
        }
    }
}
