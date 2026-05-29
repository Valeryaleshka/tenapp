namespace TenappCore.DTOs;

public class TenantDailyStatsDto
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
    public int AccumulatedCount { get; set; }
}
