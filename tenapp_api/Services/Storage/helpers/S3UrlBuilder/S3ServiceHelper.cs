using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using TenappCore.Configuration;

namespace TenappCore.Services.Storage.helpers
{
    public class S3ServiceHelper: IS3ServiceHelper
    {
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        };

        private readonly S3Options _options;

        public S3ServiceHelper(IOptions<S3Options> options)
        {
            _options = options.Value;
        }

        public string BuildPublicUrl(string bucket_name, string region,string key)
            {
                return $"https://{bucket_name}.s3.{region}.amazonaws.com/{Uri.EscapeDataString(key).Replace("%2F", "/", StringComparison.OrdinalIgnoreCase)}";
            }

        public void ValidateLogoFile(IFormFile file)
        {
            if (file.Length <= 0)
                throw new ArgumentException("logo file is required", nameof(file));

            if (file.Length > _options.MaxLogoBytes)
                throw new ArgumentException($"logo file must be {_options.MaxLogoBytes} bytes or less", nameof(file));

            if (!AllowedContentTypes.Contains(file.ContentType))
                throw new ArgumentException("logo file must be a jpeg, png, webp, or gif image", nameof(file));
        }
    }
}
