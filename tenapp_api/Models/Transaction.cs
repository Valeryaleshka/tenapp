namespace TenappCore.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
    public Property Property { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public User User { get; set; } = null!;
}
