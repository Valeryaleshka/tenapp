namespace TenappCore.DTOs;

public class PropertyDailyStatsDto
{
    public DateOnly Date { get; set; }
    public int ActiveLeaseCount { get; set; }
    public int AccumulatedStartedLeaseCount { get; set; }
}
