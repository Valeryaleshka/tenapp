namespace TenappCore.Services;

public interface ICurrentUserService
{
    bool TryGetUserId(out Guid userId);
}
