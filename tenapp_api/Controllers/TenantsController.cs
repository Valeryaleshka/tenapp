using System.IdentityModel.Tokens.Jwt;
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
    public async Task<ActionResult<IEnumerable<TenantResponseDto>>> GetAll()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        var tenants = await _dbContext.Tenants
            .AsNoTracking()
            .Include(t => t.Property)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToResponseDto(t))
            .ToListAsync();

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

        Property? assignedProperty = null;
        if (dto.PropertyId.HasValue)
        {
            assignedProperty = await _dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == dto.PropertyId.Value && p.UserId == userId);
            if (assignedProperty == null)
                return BadRequest("Selected property does not exist");

            var isAlreadyAssigned = await _dbContext.Tenants
                .AnyAsync(t => t.UserId == userId && t.PropertyId == assignedProperty.Id);
            if (isAlreadyAssigned)
                return BadRequest("Selected property already has a tenant");
        }

        var tenant = new Tenant
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Email = email,
            PropertyId = assignedProperty?.Id,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Tenants.Add(tenant);
        await _dbContext.SaveChangesAsync();

        var response = new TenantResponseDto
        {
            Id = tenant.Id,
            FirstName = tenant.FirstName,
            LastName = tenant.LastName,
            PhoneNumber = tenant.PhoneNumber,
            Email = tenant.Email,
            CreatedAt = tenant.CreatedAt,
            PropertyId = tenant.PropertyId,
            PropertyName = assignedProperty?.Name,
            PropertyAddress = assignedProperty?.Address,
            AssignedProperty = assignedProperty == null ? null : $"{assignedProperty.Name} - {assignedProperty.Address}"
        };

        return CreatedAtAction(nameof(GetAll), new { id = tenant.Id }, response);
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

        Property? assignedProperty = null;
        if (dto.PropertyId.HasValue)
        {
            assignedProperty = await _dbContext.Properties
                .FirstOrDefaultAsync(p => p.Id == dto.PropertyId.Value && p.UserId == userId);
            if (assignedProperty == null)
                return BadRequest("Selected property does not exist");

            var isAlreadyAssigned = await _dbContext.Tenants
                .AnyAsync(t => t.UserId == userId && t.PropertyId == assignedProperty.Id && t.Id != tenant.Id);
            if (isAlreadyAssigned)
                return BadRequest("Selected property already has a tenant");
        }

        tenant.FirstName = dto.FirstName.Trim();
        tenant.LastName = dto.LastName.Trim();
        tenant.PhoneNumber = dto.PhoneNumber.Trim();
        tenant.Email = email;
        tenant.PropertyId = assignedProperty?.Id;

        await _dbContext.SaveChangesAsync();

        var response = new TenantResponseDto
        {
            Id = tenant.Id,
            FirstName = tenant.FirstName,
            LastName = tenant.LastName,
            PhoneNumber = tenant.PhoneNumber,
            Email = tenant.Email,
            CreatedAt = tenant.CreatedAt,
            PropertyId = tenant.PropertyId,
            PropertyName = assignedProperty?.Name,
            PropertyAddress = assignedProperty?.Address,
            AssignedProperty = assignedProperty == null ? null : $"{assignedProperty.Name} - {assignedProperty.Address}"
        };

        return Ok(response);
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

    private static TenantResponseDto ToResponseDto(Tenant tenant)
    {
        return new TenantResponseDto
        {
            Id = tenant.Id,
            FirstName = tenant.FirstName,
            LastName = tenant.LastName,
            PhoneNumber = tenant.PhoneNumber,
            Email = tenant.Email,
            CreatedAt = tenant.CreatedAt,
            PropertyId = tenant.PropertyId,
            PropertyName = tenant.Property?.Name,
            PropertyAddress = tenant.Property?.Address,
            AssignedProperty = tenant.Property == null ? null : $"{tenant.Property.Name} - {tenant.Property.Address}"
        };
    }
}
