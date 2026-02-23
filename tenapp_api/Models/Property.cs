namespace TenappCore.Models;

public class Property
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Level { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public List<Tenant> Tenants { get; set; } = [];
}
