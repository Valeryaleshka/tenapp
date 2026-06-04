using System.ComponentModel.DataAnnotations;

namespace TenappCore.Configuration;

public class S3Options
{
    public const string SectionName = "S3";

    [Required]
    public string BucketName { get; set; } = string.Empty;

    public string Region { get; set; } = "us-east-1";

    public string? AccessKeyId { get; set; }

    public string? SecretAccessKey { get; set; }

    public string? PublicBaseUrl { get; set; }

    public string UserLogoPrefix { get; set; } = "user-logos";

    public long MaxLogoBytes { get; set; } = 2 * 1024 * 1024;
}
