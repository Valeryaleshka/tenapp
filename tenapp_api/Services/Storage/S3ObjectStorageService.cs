using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using TenappCore.Configuration;
using TenappCore.Services.Storage.helpers;

namespace TenappCore.Services.Storage;

public class S3ObjectStorageService : IS3ObjectStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Options _options;
    private readonly IS3ServiceHelper _s3ServiceHelper;

    public S3ObjectStorageService(IAmazonS3 s3Client, IOptions<S3Options> options, IS3ServiceHelper s3ServiceHelper)
    {
        _s3Client = s3Client;
        _options = options.Value;
        _s3ServiceHelper = s3ServiceHelper;
    }

    public async Task<string> UploadUserLogoAsync(Guid userId, IFormFile file, CancellationToken cancellationToken = default)
    {
        _s3ServiceHelper.ValidateLogoFile(file);

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

        return _s3ServiceHelper.BuildPublicUrl("tenapp-logos", _options.Region, key);
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
