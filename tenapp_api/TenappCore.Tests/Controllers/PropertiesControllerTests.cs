using Microsoft.AspNetCore.Mvc;
using TenappCore.Controllers;
using TenappCore.DTOs;
using TenappCore.Models;

namespace TenappCore.Tests.Controllers;

public class PropertiesControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsUnauthorizedWithoutCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(null));

        var result = await controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ScopesResultsToCurrentUserAndSorts()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        dbContext.Properties.AddRange(
            CreateProperty(userId, "Beta", level: 2),
            CreateProperty(userId, "Alpha", level: 1),
            CreateProperty(Guid.NewGuid(), "Other", level: 1));
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetAll(sortBy: "name", sortDir: "asc");

        var response = TestHelpers.ValueFromOk(result);
        Assert.Equal(2, response.TotalCount);
        Assert.Equal("Alpha", response.Items[0].Name);
    }

    [Fact]
    public async Task GetAll_FiltersByNameSearch()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        dbContext.Properties.AddRange(
            CreateProperty(userId, "Alpha House"),
            CreateProperty(userId, "Alpine Condo"),
            CreateProperty(userId, "Beta House"),
            CreateProperty(Guid.NewGuid(), "Alpha Other User"));
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetAll(search: "alp");

        var response = TestHelpers.ValueFromOk(result);
        Assert.Equal(2, response.TotalCount);
        Assert.Equal(["Alpha House", "Alpine Condo"], response.Items.Select(p => p.Name));
    }

    [Fact]
    public async Task GetById_ReturnsPropertyWithTenantName()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FirstName = "Jane",
            LastName = "Doe",
            PhoneNumber = "555",
            Email = "jane@example.com",
            CreatedAt = DateTime.UtcNow
        };
        var property = CreateProperty(userId, "Home", tenant.Id);
        dbContext.Tenants.Add(tenant);
        dbContext.Properties.Add(property);
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetById(property.Id);

        var dto = TestHelpers.ValueFromOk(result);
        Assert.Equal("Jane Doe", dto.TenantFullName);
    }

    [Fact]
    public async Task GetForSelect_ScopesResultsToCurrentUserAndSearches()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var selected = CreateProperty(userId, "Selected Home");
        dbContext.Properties.AddRange(
            CreateProperty(userId, "Alpha House"),
            CreateProperty(userId, "Beta Condo"),
            selected,
            CreateProperty(Guid.NewGuid(), "Alpha Other User"));
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetForSelect(search: "alpha", selectedPropertyId: selected.Id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var properties = Assert.IsAssignableFrom<IEnumerable<PropertySelectDto>>(ok.Value).ToList();
        Assert.Contains(properties, p => p.Id == selected.Id);
        Assert.Contains(properties, p => p.Name.StartsWith("Alpha House"));
        Assert.DoesNotContain(properties, p => p.Name.StartsWith("Alpha Other User"));
    }

    [Fact]
    public async Task GetForSelect_ReturnsUnauthorizedWithoutCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(null));

        var result = await controller.GetForSelect();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ValidatesInputsAndSelectedTenant()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var otherTenant = new Tenant
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            FirstName = "Other",
            LastName = "Tenant",
            PhoneNumber = "555",
            Email = "other@example.com",
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Tenants.Add(otherTenant);
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var badPrice = await controller.Create(new CreatePropertyDto { Name = "Home", Type = "House", Address = "Road", Price = 0, Level = 1 });
        var badTenant = await controller.Create(new CreatePropertyDto { Name = "Home", Type = "House", Address = "Road", Price = 10, Level = 1, TenantId = otherTenant.Id });

        Assert.IsType<BadRequestObjectResult>(badPrice.Result);
        Assert.IsType<BadRequestObjectResult>(badTenant.Result);
    }

    [Fact]
    public async Task Create_PersistsTrimmedPropertyForCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FirstName = "Jane",
            LastName = "Doe",
            PhoneNumber = "555",
            Email = "jane@example.com",
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Tenants.Add(tenant);
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.Create(new CreatePropertyDto
        {
            Name = " Home ",
            Type = " House ",
            Address = " Road ",
            Price = 1000,
            Level = 2,
            TenantId = tenant.Id
        });

        var dto = TestHelpers.ValueFromCreated(result);
        Assert.Equal("Home", dto.Name);
        Assert.Equal(tenant.Id, dto.TenantId);
        Assert.Equal(userId, Assert.Single(dbContext.Properties).UserId);
    }

    [Fact]
    public async Task Update_AndDelete_RespectCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var property = CreateProperty(userId, "Old");
        dbContext.Properties.Add(property);
        await dbContext.SaveChangesAsync();
        var controller = new PropertiesController(dbContext, new FakeCurrentUserService(userId));

        var updated = await controller.Update(property.Id, new CreatePropertyDto
        {
            Name = "New",
            Type = "Condo",
            Address = "Road",
            Price = 2000,
            Level = 3
        });
        var deleted = await controller.Delete(property.Id);

        Assert.Equal("New", TestHelpers.ValueFromOk(updated).Name);
        Assert.IsType<NoContentResult>(deleted);
        Assert.Empty(dbContext.Properties);
    }

    private static Property CreateProperty(Guid userId, string name, Guid? tenantId = null, int level = 1)
    {
        return new Property
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Type = "House",
            Address = $"{name} Road",
            Price = 1000,
            Level = level,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
