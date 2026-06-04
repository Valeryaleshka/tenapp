using Microsoft.AspNetCore.Mvc;
using TenappCore.Controllers;
using TenappCore.DTOs;
using TenappCore.Models;

namespace TenappCore.Tests.Controllers;

public class TransactionsControllerTests
{
    [Fact]
    public async Task GetAll_ReturnsUnauthorizedWithoutCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var controller = new TransactionsController(dbContext, new FakeCurrentUserService(null));

        var result = await controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAll_ScopesResultsToCurrentUserAndIncludesNames()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var category = CreateCategory();
        var property = CreateProperty(userId, "Home");
        var tenant = CreateTenant(userId, "Jane", "Doe");
        dbContext.Categories.Add(category);
        dbContext.Properties.Add(property);
        dbContext.Tenants.Add(tenant);
        dbContext.Transactions.AddRange(
            CreateTransaction(userId, property.Id, tenant.Id, category.Id, 1000),
            CreateTransaction(Guid.NewGuid(), property.Id, tenant.Id, category.Id, 2000));
        await dbContext.SaveChangesAsync();
        var controller = new TransactionsController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.GetAll();

        var response = TestHelpers.ValueFromOk(result);
        var transaction = Assert.Single(response.Items);
        Assert.Equal("Home", transaction.PropertyName);
        Assert.Equal("Jane Doe", transaction.TenantFullName);
        Assert.Equal("rent", transaction.CategoryName);
    }

    [Fact]
    public async Task GetCategories_ReturnsSeededCategoryShape()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        dbContext.Categories.AddRange(CreateCategory(), new Category { Id = 2, Name = "demage deposit" });
        await dbContext.SaveChangesAsync();
        var controller = new TransactionsController(dbContext, new FakeCurrentUserService(Guid.NewGuid()));

        var result = await controller.GetCategories();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var categories = Assert.IsAssignableFrom<IEnumerable<CategoryResponseDto>>(ok.Value).ToList();
        Assert.Equal(["rent", "demage deposit"], categories.Select(c => c.Name));
    }

    [Fact]
    public async Task Create_ValidatesRelatedRecordsAreOwnedByCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var category = CreateCategory();
        var otherProperty = CreateProperty(otherUserId, "Other Home");
        var tenant = CreateTenant(userId, "Jane", "Doe");
        dbContext.Categories.Add(category);
        dbContext.Properties.Add(otherProperty);
        dbContext.Tenants.Add(tenant);
        await dbContext.SaveChangesAsync();
        var controller = new TransactionsController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.Create(new CreateTransactionDto
        {
            PropertyId = otherProperty.Id,
            TenantId = tenant.Id,
            Amount = 100,
            Date = DateTime.UtcNow,
            CategoryId = category.Id
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(dbContext.Transactions);
    }

    [Fact]
    public async Task Create_PersistsTransactionForCurrentUser()
    {
        await using var dbContext = TestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var category = CreateCategory();
        var property = CreateProperty(userId, "Home");
        var tenant = CreateTenant(userId, "Jane", "Doe");
        dbContext.Categories.Add(category);
        dbContext.Properties.Add(property);
        dbContext.Tenants.Add(tenant);
        await dbContext.SaveChangesAsync();
        var controller = new TransactionsController(dbContext, new FakeCurrentUserService(userId));

        var result = await controller.Create(new CreateTransactionDto
        {
            PropertyId = property.Id,
            TenantId = tenant.Id,
            Amount = 1234.56m,
            Date = new DateTime(2026, 6, 4, 0, 0, 0, DateTimeKind.Utc),
            CategoryId = category.Id
        });

        var dto = TestHelpers.ValueFromCreated(result);
        var transaction = Assert.Single(dbContext.Transactions);
        Assert.Equal(userId, transaction.UserId);
        Assert.Equal(1234.56m, dto.Amount);
        Assert.Equal(property.Id, dto.PropertyId);
        Assert.Equal(tenant.Id, dto.TenantId);
    }

    private static Category CreateCategory()
    {
        return new Category
        {
            Id = 1,
            Name = "rent"
        };
    }

    private static Property CreateProperty(Guid userId, string name)
    {
        return new Property
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Type = "House",
            Address = $"{name} Road",
            Price = 1000,
            Level = 1,
            CreatedAt = DateTime.UtcNow
        };
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
            Email = $"{firstName.ToLowerInvariant()}@example.com",
            CreatedAt = DateTime.UtcNow
        };
    }

    private static Transaction CreateTransaction(
        Guid userId,
        Guid propertyId,
        Guid tenantId,
        int categoryId,
        decimal amount)
    {
        return new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PropertyId = propertyId,
            TenantId = tenantId,
            CategoryId = categoryId,
            Amount = amount,
            Date = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }
}
