using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class IncidentUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Incidents_JobTimes_JobTimeId",
                table: "Incidents");

            migrationBuilder.DropIndex(
                name: "IX_Incidents_JobTimeId",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ReportedAt",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ReportedBy",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ResolutionNotes",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ResolvedBy",
                table: "Incidents");

            migrationBuilder.RenameColumn(
                name: "PhotoUrl",
                table: "Incidents",
                newName: "PhotoPath");

            migrationBuilder.RenameColumn(
                name: "JobTimeId",
                table: "Incidents",
                newName: "ClientId");

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

            migrationBuilder.AddColumn<TimeSpan>(
                name: "IncidentTime",
                table: "Incidents",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "StaffId",
                table: "Incidents",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_JobTimes_IncidentId",
                table: "JobTimes",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_ClientId",
                table: "Incidents",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_StaffId",
                table: "Incidents",
                column: "StaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_Incidents_AspNetUsers_StaffId",
                table: "Incidents",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Incidents_Clients_ClientId",
                table: "Incidents",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobTimes_Incidents_IncidentId",
                table: "JobTimes",
                column: "IncidentId",
                principalTable: "Incidents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Incidents_AspNetUsers_StaffId",
                table: "Incidents");

            migrationBuilder.DropForeignKey(
                name: "FK_Incidents_Clients_ClientId",
                table: "Incidents");

            migrationBuilder.DropForeignKey(
                name: "FK_JobTimes_Incidents_IncidentId",
                table: "JobTimes");

            migrationBuilder.DropIndex(
                name: "IX_JobTimes_IncidentId",
                table: "JobTimes");

            migrationBuilder.DropIndex(
                name: "IX_Incidents_ClientId",
                table: "Incidents");

            migrationBuilder.DropIndex(
                name: "IX_Incidents_StaffId",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "IncidentId",
                table: "JobTimes");

            migrationBuilder.DropColumn(
                name: "IncidentTime",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "StaffId",
                table: "Incidents");

            migrationBuilder.RenameColumn(
                name: "PhotoPath",
                table: "Incidents",
                newName: "PhotoUrl");

            migrationBuilder.RenameColumn(
                name: "ClientId",
                table: "Incidents",
                newName: "JobTimeId");

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

            migrationBuilder.AddColumn<DateTime>(
                name: "ReportedAt",
                table: "Incidents",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ReportedBy",
                table: "Incidents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResolutionNotes",
                table: "Incidents",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Incidents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResolvedBy",
                table: "Incidents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_JobTimeId",
                table: "Incidents",
                column: "JobTimeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Incidents_JobTimes_JobTimeId",
                table: "Incidents",
                column: "JobTimeId",
                principalTable: "JobTimes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
