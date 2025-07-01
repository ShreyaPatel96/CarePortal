using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DocumentUpdateSecond : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FilePath",
                table: "ClientDocuments",
                newName: "FileName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FileName",
                table: "ClientDocuments",
                newName: "FilePath");
        }
    }
}
