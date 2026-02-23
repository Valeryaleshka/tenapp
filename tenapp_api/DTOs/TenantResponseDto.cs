namespace TenappCore.DTOs;

public class TenantResponseDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? PropertyId { get; set; }
    public string? PropertyName { get; set; }
    public string? PropertyAddress { get; set; }
    public string? AssignedProperty { get; set; }
}
