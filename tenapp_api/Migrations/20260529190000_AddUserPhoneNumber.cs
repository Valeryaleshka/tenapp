using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenappCore.Migrations
{
    public partial class AddUserPhoneNumber : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "phone_number",
                table: "user",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "phone_number",
                table: "user");
        }
    }
}
