namespace TenappCore.Services;

public sealed record PasswordResetToken(string RawToken, string Hash, DateTime ExpiresAt);

