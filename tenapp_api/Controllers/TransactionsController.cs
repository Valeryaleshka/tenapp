using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenappCore.Data;
using TenappCore.DTOs;
using TenappCore.Models;
using TenappCore.Services;

namespace TenappCore.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ICurrentUserService _currentUserService;
    private readonly AppDbContext _dbContext;

    public TransactionsController(AppDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDto<TransactionResponseDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        if (!_currentUserService.TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        var totalCount = await query.CountAsync();

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                PropertyId = t.PropertyId,
                PropertyName = t.Property.Name,
                TenantId = t.TenantId,
                TenantFullName = t.Tenant.FirstName + " " + t.Tenant.LastName,
                Amount = t.Amount,
                Date = t.Date,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResponseDto<TransactionResponseDto>
        {
            Items = transactions,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetCategories()
    {
        var categories = await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponseDto>> Create(CreateTransactionDto dto)
    {
        if (!_currentUserService.TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        if (dto.Amount <= 0)
            return BadRequest("amount must be greater than 0");

        var property = await _dbContext.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == dto.PropertyId && p.UserId == userId);
        if (property == null)
            return BadRequest("Selected property does not exist");

        var tenant = await _dbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == dto.TenantId && t.UserId == userId);
        if (tenant == null)
            return BadRequest("Selected tenant does not exist");

        var category = await _dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId);
        if (category == null)
            return BadRequest("Selected category does not exist");

        var transaction = new Transaction
        {
            PropertyId = property.Id,
            TenantId = tenant.Id,
            Amount = dto.Amount,
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            CategoryId = category.Id,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        var response = new TransactionResponseDto
        {
            Id = transaction.Id,
            PropertyId = property.Id,
            PropertyName = property.Name,
            TenantId = tenant.Id,
            TenantFullName = $"{tenant.FirstName} {tenant.LastName}",
            Amount = transaction.Amount,
            Date = transaction.Date,
            CategoryId = category.Id,
            CategoryName = category.Name,
            CreatedAt = transaction.CreatedAt
        };

        return CreatedAtAction(nameof(GetAll), new { id = transaction.Id }, response);
    }
}
