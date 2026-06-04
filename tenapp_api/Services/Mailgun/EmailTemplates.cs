using TenappCore.Models;

namespace TenappCore.Services.Mailgun;

public static class EmailTemplates
{
    public static MailgunMessage Welcome(User user)
    {
        return new MailgunMessage(
            To: user.Email,
            Subject: "Welcome to Tenapp Core",
            Text: $"Hello {user.FirstName}, welcome to Tenapp Core.");
    }

    public static MailgunMessage PasswordReset(User user, string resetUrl)
    {
        return new MailgunMessage(
            To: user.Email,
            Subject: "Tenapp Core password reset",
            Text: $"Use this link to reset your password: {resetUrl}\nThe link expires in 1 hour.");
    }
}
