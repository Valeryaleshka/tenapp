using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using TenappCore.Configuration;
using TenappCore.Services.Storage.helpers;

namespace TenappCore.Services.Storage;

public class S3ObjectStorageService : IS3ObjectStorageService
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    };

    private readonly IAmazonS3 _s3Client;
    private readonly S3Options _options;
    private readonly IS3UrlBuilder _urlBuilder;

    public S3ObjectStorageService(IAmazonS3 s3Client, IOptions<S3Options> options, IS3UrlBuilder urlBuilder)
    {
        _s3Client = s3Client;
        _options = options.Value;
        _urlBuilder = urlBuilder;
    }

    public async Task<string> UploadUserLogoAsync(Guid userId, IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
            throw new ArgumentException("logo file is required", nameof(file));

        if (file.Length > _options.MaxLogoBytes)
            throw new ArgumentException($"logo file must be {_options.MaxLogoBytes} bytes or less", nameof(file));

        if (!AllowedContentTypes.Contains(file.ContentType))
            throw new ArgumentException("logo file must be a jpeg, png, webp, or gif image", nameof(file));

        var extension = GetExtension(file.ContentType);
        var prefix = _options.UserLogoPrefix.Trim().Trim('/');
        var key = $"{prefix}/{userId:N}/{Guid.NewGuid():N}{extension}";

        await using var stream = file.OpenReadStream();
        var request = new PutObjectRequest
        {
            BucketName = "tenapp-logos",
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType,
            AutoCloseStream = false
        };

        await _s3Client.PutObjectAsync(request, cancellationToken);

        return _urlBuilder.BuildPublicUrl("tenapp-logos", _options.Region, key);
    }

    private static string GetExtension(string contentType)
    {
        return contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            "image/gif" => ".gif",
            _ => ".img"
        };
    }
}
