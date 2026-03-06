using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenappCore.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyStartEndDatesAsDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "end_date",
                table: "property",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "start_date",
                table: "property",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "end_date",
                table: "property");

            migrationBuilder.DropColumn(
                name: "start_date",
                table: "property");
        }
    }
}
