namespace TenappCore.DTOs;

public class CreatePropertyDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Level { get; set; }
    public Guid? TenantId { get; set; }
}
