using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TenappCore.Services.Storage.helpers
{
    public interface IS3UrlBuilder
    {
        public string BuildPublicUrl(string bucket_name, string region,string key);
        
    }
}