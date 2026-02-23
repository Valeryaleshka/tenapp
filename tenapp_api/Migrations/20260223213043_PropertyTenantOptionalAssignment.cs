using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenappCore.Migrations
{
    /// <inheritdoc />
    public partial class PropertyTenantOptionalAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tenant_property_id",
                table: "tenant");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_property_id",
                table: "tenant",
                column: "property_id",
                unique: true,
                filter: "\"property_id\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tenant_property_id",
                table: "tenant");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_property_id",
                table: "tenant",
                column: "property_id");
        }
    }
}
