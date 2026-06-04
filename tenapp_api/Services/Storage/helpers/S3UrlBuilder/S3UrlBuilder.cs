using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TenappCore.Services.Storage.helpers;

namespace TenappCore.Services.Storage.helpers
{
    public class S3UrlBuilder: IS3UrlBuilder
    {

        public string BuildPublicUrl(string bucket_name, string region,string key)
    {

        return $"https://{bucket_name}.s3.{region}.amazonaws.com/{Uri.EscapeDataString(key).Replace("%2F", "/", StringComparison.OrdinalIgnoreCase)}";
    }

        
    }
}