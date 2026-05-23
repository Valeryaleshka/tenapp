using Microsoft.AspNetCore.Mvc;

public static class ApiBehaviorConfiguration
{
    public static IServiceCollection AddCustomApiBehavior(this IServiceCollection services)
    {
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(kvp => kvp.Value!.Errors.Select(e =>
                        $"{kvp.Key}: {e.ErrorMessage}"
                    ))
                    .ToArray();

                return new BadRequestObjectResult(new
                {
                    errors
                });
            };
        });

        return services;
    }
}