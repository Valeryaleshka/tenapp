using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenappCore.Migrations
{
    /// <inheritdoc />
    public partial class TenantManyProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "tenant_id",
                table: "property",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE property p
                SET tenant_id = t.id
                FROM tenant t
                WHERE t.property_id = p.id
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_tenant_property_property_id",
                table: "tenant");

            migrationBuilder.DropIndex(
                name: "IX_tenant_property_id",
                table: "tenant");

            migrationBuilder.DropColumn(
                name: "property_id",
                table: "tenant");

            migrationBuilder.CreateIndex(
                name: "IX_property_tenant_id",
                table: "property",
                column: "tenant_id");

            migrationBuilder.AddForeignKey(
                name: "FK_property_tenant_tenant_id",
                table: "property",
                column: "tenant_id",
                principalTable: "tenant",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "property_id",
                table: "tenant",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE tenant t
                SET property_id = p.id
                FROM property p
                WHERE p.tenant_id = t.id
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_property_tenant_tenant_id",
                table: "property");

            migrationBuilder.DropIndex(
                name: "IX_property_tenant_id",
                table: "property");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "property");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_property_id",
                table: "tenant",
                column: "property_id",
                unique: true,
                filter: "\"property_id\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_tenant_property_property_id",
                table: "tenant",
                column: "property_id",
                principalTable: "property",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
