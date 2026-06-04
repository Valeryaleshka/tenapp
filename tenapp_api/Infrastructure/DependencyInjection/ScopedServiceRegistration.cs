using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TenappCore.Data;
using TenappCore.Models;
using TenappCore.Services;
using TenappCore.Services.Mailgun;
using TenappCore.Services.Storage;

namespace TenappCore.Infrastructure.DependencyInjection;

public static class ScopedServiceRegistration
{
    public static IServiceCollection AddScopedServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICookieService, CookieService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IS3ObjectStorageService, S3ObjectStorageService>();
        services.AddScoped<IMailgunService, MailgunService>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
