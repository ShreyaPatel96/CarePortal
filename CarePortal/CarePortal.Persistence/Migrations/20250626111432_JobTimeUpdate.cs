using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class JobTimeUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "JobTimes");

            migrationBuilder.AddColumn<int>(
                name: "ActivityType",
                table: "JobTimes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityType",
                table: "JobTimes");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "JobTimes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
