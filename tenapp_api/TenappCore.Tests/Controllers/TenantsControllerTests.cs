using Microsoft.AspNetCore.Mvc;
using TenappCore.Controllers;
using TenappCore.DTOs;
using TenappCore.Models;

namespace TenappCore.Tests.Controllers;

public class TenantsControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsUnauthorizedWithoutCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(null));

        var result = await controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ScopesResultsToCurrentUserAndPaginates()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        dbContext.Tenants.AddRange(
            CreateTenant(userId, "Beth", "Baker"),
            CreateTenant(userId, "Adam", "Able"),
            CreateTenant(otherUserId, "Other", "User"));
        await dbContext.SaveChangesAsync();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetAll(page: 1, pageSize: 1);

        var response = TestHelpers.ValueFromOk(result);
        Assert.Equal(2, response.TotalCount);
        Assert.Equal(2, response.TotalPages);
        Assert.Single(response.Items);
        Assert.Equal("Adam", response.Items[0].FirstName);
    }

    [Fact]
    public async Task GetById_ReturnsNotFoundForOtherUsersTenant()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var tenant = CreateTenant(Guid.NewGuid(), "Other", "User");
        dbContext.Tenants.Add(tenant);
        await dbContext.SaveChangesAsync();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(Guid.NewGuid()));

        var result = await controller.GetById(tenant.Id);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ValidatesAndPersistsNormalizedTenant()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(userId));

        var invalid = await controller.Create(new CreateTenantDto
        {
            FirstName = "Jane",
            LastName = "Doe",
            PhoneNumber = "555",
            Email = "bad-email"
        });
        var created = await controller.Create(new CreateTenantDto
        {
            FirstName = " Jane ",
            LastName = " Doe ",
            PhoneNumber = " 555 ",
            Email = " JANE@EXAMPLE.COM "
        });

        Assert.IsType<BadRequestObjectResult>(invalid.Result);
        var dto = TestHelpers.ValueFromCreated(created);
        Assert.Equal("Jane", dto.FirstName);
        Assert.Equal("jane@example.com", dto.Email);
        Assert.Equal(userId, Assert.Single(dbContext.Tenants).UserId);
    }

    [Fact]
    public async Task Update_AndDelete_RespectCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var tenant = CreateTenant(userId, "Old", "Name");
        dbContext.Tenants.Add(tenant);
        await dbContext.SaveChangesAsync();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(userId));

        var updated = await controller.Update(tenant.Id, new CreateTenantDto
        {
            FirstName = "New",
            LastName = "Name",
            PhoneNumber = "555",
            Email = "new@example.com"
        });
        var deleted = await controller.Delete(tenant.Id);

        Assert.Equal("New", TestHelpers.ValueFromOk(updated).FirstName);
        Assert.IsType<NoContentResult>(deleted);
        Assert.Empty(dbContext.Tenants);
    }

    [Fact]
    public async Task GetForSelect_IncludesSelectedTenantOutsideLimit()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var selected = CreateTenant(userId, "Zoe", "Selected");
        dbContext.Tenants.AddRange(CreateTenant(userId, "Amy", "First"), selected);
        await dbContext.SaveChangesAsync();
        var controller = new TenantsController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetForSelect(limit: 1, selectedTenantId: selected.Id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var tenants = Assert.IsAssignableFrom<IEnumerable<TenantSelectDto>>(ok.Value).ToList();
        Assert.Equal(selected.Id, tenants[0].Id);
        Assert.Equal(2, tenants.Count);
    }

    private static Tenant CreateTenant(Guid userId, string firstName, string lastName)
    {
        return new Tenant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = "555",
            Email = $"{firstName}.{lastName}@example.com".ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow
        };
    }
}

