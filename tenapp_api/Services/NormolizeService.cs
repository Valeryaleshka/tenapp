namespace TenappApi.Services;
public static class NormalizeService
{
    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    public static string NormalizeText(string text)
    {
        return text?.Trim() ?? string.Empty;
    }
}