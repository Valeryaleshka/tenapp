using System.IdentityModel.Tokens.Jwt;
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
public class PropertiesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public PropertiesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PropertyResponseDto>>> GetAll()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        var properties = await _dbContext.Properties
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToResponseDto(p))
            .ToListAsync();

        return Ok(properties);
    }

    [HttpPost]
    public async Task<ActionResult<PropertyResponseDto>> Create(CreatePropertyDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type) || string.IsNullOrWhiteSpace(dto.Address))
            return BadRequest("name, type and address are required");
        if (dto.Price <= 0)
            return BadRequest("price must be greater than 0");
        if (dto.Level < 1 || dto.Level > 100)
            return BadRequest("level must be between 1 and 100");

        var property = new Property
        {
            Name = dto.Name.Trim(),
            Type = dto.Type.Trim(),
            Address = dto.Address.Trim(),
            Price = dto.Price,
            Level = dto.Level,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Properties.Add(property);
        await _dbContext.SaveChangesAsync();

        var response = ToResponseDto(property);
        return CreatedAtAction(nameof(GetAll), new { id = property.Id }, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PropertyResponseDto>> Update(Guid id, CreatePropertyDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Type) || string.IsNullOrWhiteSpace(dto.Address))
            return BadRequest("name, type and address are required");
        if (dto.Price <= 0)
            return BadRequest("price must be greater than 0");
        if (dto.Level < 1 || dto.Level > 100)
            return BadRequest("level must be between 1 and 100");

        var property = await _dbContext.Properties
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (property == null)
            return NotFound();

        property.Name = dto.Name.Trim();
        property.Type = dto.Type.Trim();
        property.Address = dto.Address.Trim();
        property.Price = dto.Price;
        property.Level = dto.Level;

        await _dbContext.SaveChangesAsync();

        return Ok(ToResponseDto(property));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Invalid access token");

        var property = await _dbContext.Properties
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (property == null)
            return NotFound();

        _dbContext.Properties.Remove(property);
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

    private static PropertyResponseDto ToResponseDto(Property property)
    {
        return new PropertyResponseDto
        {
            Id = property.Id,
            Name = property.Name,
            Type = property.Type,
            Address = property.Address,
            Price = property.Price,
            Level = property.Level,
            CreatedAt = property.CreatedAt
        };
    }
}
