using Microsoft.AspNetCore.Http;

namespace TenappCore.Services.Storage;

public interface IS3ObjectStorageService
{
    Task<string> UploadUserLogoAsync(Guid userId, IFormFile file, CancellationToken cancellationToken = default);
}
