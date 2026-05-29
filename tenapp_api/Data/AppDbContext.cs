using Microsoft.EntityFrameworkCore;
using TenappCore.Models;

namespace TenappCore.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Property> Properties { get; set; }
    public DbSet<Tenant> Tenants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("user");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .IsRequired()
                .HasMaxLength(255);
            entity.HasIndex(e => e.Email)
                .IsUnique();
            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.FirstName)
                .HasColumnName("first_name")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.SecondName)
                .HasColumnName("second_name")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.PhoneNumber)
                .HasColumnName("phone_number")
                .HasMaxLength(30);
            entity.Property(e => e.RefreshToken)
                .HasColumnName("refresh_token")
                .HasMaxLength(2000);
            entity.Property(e => e.PasswordResetTokenHash)
                .HasColumnName("password_reset_token_hash")
                .HasMaxLength(64);
            entity.Property(e => e.PasswordResetTokenExpiresAt)
                .HasColumnName("password_reset_token_expires_at");
            entity.HasIndex(e => e.PasswordResetTokenHash);
        });

        modelBuilder.Entity<Property>(entity =>
        {
            entity.ToTable("property");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Type)
                .HasColumnName("type")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Address)
                .HasColumnName("address")
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Price)
                .HasColumnName("price")
                .HasColumnType("numeric(18,2)")
                .IsRequired();
            entity.Property(e => e.Level)
                .HasColumnName("level")
                .IsRequired();
            entity.Property(e => e.StartDate)
                .HasColumnName("start_date")
                .HasColumnType("date");
            entity.Property(e => e.EndDate)
                .HasColumnName("end_date")
                .HasColumnType("date");
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("timezone('utc', now())");
            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();
            entity.Property(e => e.TenantId)
                .HasColumnName("tenant_id");
            entity.HasOne(e => e.User)
                .WithMany(u => u.Properties)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Properties)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => e.TenantId);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("tenant");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.FirstName)
                .HasColumnName("first_name")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.LastName)
                .HasColumnName("last_name")
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.PhoneNumber)
                .HasColumnName("phone_number")
                .IsRequired()
                .HasMaxLength(30);
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("timezone('utc', now())");
            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.Tenants)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.UserId, e.Email });
        });
    }
}
