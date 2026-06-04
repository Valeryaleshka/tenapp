using Microsoft.AspNetCore.Http;

namespace TenappCore.Services.Storage.helpers
{
    public interface IS3ServiceHelper
    {
        public string BuildPublicUrl(string bucket_name, string region,string key);
        public void ValidateLogoFile(IFormFile file);
    }
}
