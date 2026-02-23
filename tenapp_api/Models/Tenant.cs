namespace TenappCore.Models;

public class Tenant
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
    public Guid? PropertyId { get; set; }
    public User User { get; set; } = null!;
    public Property? Property { get; set; }
}
