using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Net.Mail;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenappCore.Data;
using TenappCore.DTOs;
using TenappCore.Models;

namespace TenappCore.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TenantsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDto<TenantResponseDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] TenantSortBy sortBy = TenantSortBy.FirstName,
        [FromQuery] SortDirection sortDir = SortDirection.Asc)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var filteredQuery = _dbContext.Tenants
            .AsNoTracking()
            .Include(t => t.Properties)
            .Where(t => t.UserId == userId);

        if (!Enum.IsDefined(sortBy))
            return BadRequest("sortBy must be one of: id, firstName, lastName, phoneNumber, email, createdAt, userId");

        if (!Enum.IsDefined(sortDir))
            return BadRequest("sortDir must be 'asc' or 'desc'");

        var descending = sortDir == SortDirection.Desc;

        Expression<Func<Tenant, object>> sortExpression = sortBy switch
        {
            TenantSortBy.Id => t => t.Id,
            TenantSortBy.LastName => t => t.LastName,
            TenantSortBy.FirstName => t => t.FirstName,
            TenantSortBy.PhoneNumber => t => t.PhoneNumber,
            TenantSortBy.Email => t => t.Email,
            TenantSortBy.CreatedAt => t => t.CreatedAt,
            TenantSortBy.UserId => t => t.UserId,
            _ => throw new ArgumentOutOfRangeException(nameof(sortBy), sortBy, null)
        };

        var sortedQuery = descending
            ? filteredQuery.OrderByDescending(sortExpression)
            : filteredQuery.OrderBy(sortExpression);

        sortedQuery = sortedQuery.ThenBy(t => t.Id);

        var totalCount = await filteredQuery.CountAsync();

        var tenants = await sortedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => ToResponseDto(t))
            .ToListAsync();
    
        return Ok(new PagedResponseDto<TenantResponseDto>
        {
            Items = tenants,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TenantResponseDto>> GetById(Guid id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        var tenant = await _dbContext.Tenants
            .AsNoTracking()
            .Include(t => t.Properties)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tenant == null)
            return NotFound();

        return Ok(ToResponseDto(tenant));
    }

    [HttpGet("select")]
    public async Task<ActionResult<IEnumerable<TenantSelectDto>>> GetForSelect(
        [FromQuery] string? search = null,
        [FromQuery] int limit = 50,
        [FromQuery] Guid? selectedTenantId = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        limit = Math.Clamp(limit, 1, 100);

        var query = _dbContext.Tenants
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{EscapeLikePattern(search.Trim())}%";
            query = query.Where(t =>
                EF.Functions.ILike(t.FirstName, pattern) ||
                EF.Functions.ILike(t.LastName, pattern) ||
                EF.Functions.ILike(t.FirstName + " " + t.LastName, pattern) ||
                EF.Functions.ILike(t.Email, pattern));
        }

        var tenants = await query
            .OrderBy(t => t.FirstName)
            .ThenBy(t => t.LastName)
            .Take(limit)
            .Select(t => new TenantSelectDto
            {
                Id = t.Id,
                Name = t.FirstName + " " + t.LastName
            })
            .ToListAsync();

        if (selectedTenantId.HasValue && tenants.All(t => t.Id != selectedTenantId.Value))
        {
            var selectedTenant = await _dbContext.Tenants
                .AsNoTracking()
                .Where(t => t.UserId == userId && t.Id == selectedTenantId.Value)
                .Select(t => new TenantSelectDto
                {
                    Id = t.Id,
                    Name = t.FirstName + " " + t.LastName
                })
                .FirstOrDefaultAsync();

            if (selectedTenant != null)
                tenants.Insert(0, selectedTenant);
        }

        return Ok(tenants);
    }

    [HttpPost]
    public async Task<ActionResult<TenantResponseDto>> Create(CreateTenantDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName) ||
            string.IsNullOrWhiteSpace(dto.PhoneNumber) ||
            string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("firstName, lastName, phoneNumber and email are required");
        }

        var email = dto.Email.Trim().ToLowerInvariant();
        if (!IsValidEmail(email))
            return BadRequest("Invalid email format");

        var tenant = new Tenant
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Email = email,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Tenants.Add(tenant);
        await _dbContext.SaveChangesAsync();

        var createdTenant = await _dbContext.Tenants
            .AsNoTracking()
            .Include(t => t.Properties)
            .FirstAsync(t => t.Id == tenant.Id);

        return CreatedAtAction(nameof(GetAll), new { id = tenant.Id }, ToResponseDto(createdTenant));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TenantResponseDto>> Update(Guid id, CreateTenantDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName) ||
            string.IsNullOrWhiteSpace(dto.PhoneNumber) ||
            string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest("firstName, lastName, phoneNumber and email are required");
        }

        var email = dto.Email.Trim().ToLowerInvariant();
        if (!IsValidEmail(email))
            return BadRequest("Invalid email format");

        var tenant = await _dbContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (tenant == null)
            return NotFound();

        tenant.FirstName = dto.FirstName.Trim();
        tenant.LastName = dto.LastName.Trim();
        tenant.PhoneNumber = dto.PhoneNumber.Trim();
        tenant.Email = email;

        await _dbContext.SaveChangesAsync();

        var updatedTenant = await _dbContext.Tenants
            .AsNoTracking()
            .Include(t => t.Properties)
            .FirstAsync(t => t.Id == tenant.Id);

        return Ok(ToResponseDto(updatedTenant));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        var tenant = await _dbContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (tenant == null)
            return NotFound();

        _dbContext.Tenants.Remove(tenant);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private bool TryGetUserId(out Guid userId)
    {
        var subject =
            User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(subject, out userId);
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string EscapeLikePattern(string value)
    {
        return value
            .Replace(@"\", @"\\")
            .Replace("%", @"\%")
            .Replace("_", @"\_");
    }

    private static TenantResponseDto ToResponseDto(Tenant tenant)
    {
        var assignedProperties = tenant.Properties
            .Select(p => $"{p.Name} - {p.Address}")
            .ToList();

        return new TenantResponseDto
        {
            Id = tenant.Id,
            FirstName = tenant.FirstName,
            LastName = tenant.LastName,
            PhoneNumber = tenant.PhoneNumber,
            Email = tenant.Email,
            CreatedAt = tenant.CreatedAt,
            PropertyCount = assignedProperties.Count,
            AssignedProperties = assignedProperties,
            Properties = tenant.Properties
                .Select(p => new TenantPropertyLinkDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Address = p.Address
                })
                .ToList()
        };
    }
}
