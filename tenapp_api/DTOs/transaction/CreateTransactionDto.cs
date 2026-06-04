namespace TenappCore.DTOs;

public class CreateTransactionDto
{
    public Guid PropertyId { get; set; }
    public Guid TenantId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int CategoryId { get; set; }
}
