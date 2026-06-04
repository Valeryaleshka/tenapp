using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using TenappCore.Configuration;
using TenappCore.Services.Storage.helpers;

namespace TenappCore.Tests.Services;

public class S3ServiceHelperTests
{
    [Fact]
    public void ValidateLogoFile_AcceptsAllowedContentTypes()
    {
        var helper = CreateHelper();

        helper.ValidateLogoFile(CreateFormFile(contentType: "image/jpeg"));
        helper.ValidateLogoFile(CreateFormFile(contentType: "image/png"));
        helper.ValidateLogoFile(CreateFormFile(contentType: "image/webp"));
        helper.ValidateLogoFile(CreateFormFile(contentType: "image/gif"));
        helper.ValidateLogoFile(CreateFormFile(contentType: "IMAGE/PNG"));
    }

    [Fact]
    public void ValidateLogoFile_RejectsEmptyFile()
    {
        var helper = CreateHelper();

        var exception = Assert.Throws<ArgumentException>(() =>
            helper.ValidateLogoFile(CreateFormFile(length: 0)));

        Assert.Equal("file", exception.ParamName);
        Assert.StartsWith("logo file is required", exception.Message);
    }

    [Fact]
    public void ValidateLogoFile_RejectsOversizedFile()
    {
        var helper = CreateHelper(maxLogoBytes: 2);

        var exception = Assert.Throws<ArgumentException>(() =>
            helper.ValidateLogoFile(CreateFormFile(length: 3)));

        Assert.Equal("file", exception.ParamName);
        Assert.StartsWith("logo file must be 2 bytes or less", exception.Message);
    }

    [Fact]
    public void ValidateLogoFile_RejectsUnsupportedContentType()
    {
        var helper = CreateHelper();

        var exception = Assert.Throws<ArgumentException>(() =>
            helper.ValidateLogoFile(CreateFormFile(contentType: "application/pdf")));

        Assert.Equal("file", exception.ParamName);
        Assert.StartsWith("logo file must be a jpeg, png, webp, or gif image", exception.Message);
    }

    private static S3ServiceHelper CreateHelper(long maxLogoBytes = 10)
    {
        return new S3ServiceHelper(Options.Create(new S3Options
        {
            MaxLogoBytes = maxLogoBytes
        }));
    }

    private static IFormFile CreateFormFile(long length = 1, string contentType = "image/png")
    {
        var stream = new MemoryStream(new byte[length]);
        return new FormFile(stream, 0, length, "file", "logo.png")
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }
}
