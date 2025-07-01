using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Cloumnname : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobTimes_Incidents_IncidentId",
                table: "JobTimes");

            migrationBuilder.DropIndex(
                name: "IX_JobTimes_IncidentId",
                table: "JobTimes");

            migrationBuilder.DropColumn(
                name: "IncidentId",
                table: "JobTimes");

            migrationBuilder.DropColumn(
                name: "EmergencyContact",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "EmergencyPhone",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "MedicalNotes",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "ClientDocuments");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "PhotoPath",
                table: "Incidents",
                newName: "FileName");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Incidents",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 1);

            migrationBuilder.AlterColumn<int>(
                name: "Severity",
                table: "Incidents",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 1);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Incidents",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FileName",
                table: "Incidents",
                newName: "PhotoPath");

            migrationBuilder.AddColumn<int>(
                name: "IncidentId",
                table: "JobTimes",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Incidents",
                type: "int",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "Severity",
                table: "Incidents",
                type: "int",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Incidents",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContact",
                table: "Clients",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EmergencyPhone",
                table: "Clients",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MedicalNotes",
                table: "Clients",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "ClientDocuments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobTimes_IncidentId",
                table: "JobTimes",
                column: "IncidentId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobTimes_Incidents_IncidentId",
                table: "JobTimes",
                column: "IncidentId",
                principalTable: "Incidents",
                principalColumn: "Id");
        }
    }
}
