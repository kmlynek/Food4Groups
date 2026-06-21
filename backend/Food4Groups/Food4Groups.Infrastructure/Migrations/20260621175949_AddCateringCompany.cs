using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Food4Groups.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCateringCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "MenuPeriods",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "CateringCompanyId",
                table: "MenuPeriods",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CateringCompanyId",
                table: "Dishes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "CateringCompanies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CateringCompanyId",
                table: "Addons",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_MenuPeriods_CateringCompanyId",
                table: "MenuPeriods",
                column: "CateringCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_CateringCompanyId",
                table: "Dishes",
                column: "CateringCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Addons_CateringCompanyId",
                table: "Addons",
                column: "CateringCompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Addons_CateringCompanies_CateringCompanyId",
                table: "Addons",
                column: "CateringCompanyId",
                principalTable: "CateringCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_CateringCompanies_CateringCompanyId",
                table: "Dishes",
                column: "CateringCompanyId",
                principalTable: "CateringCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MenuPeriods_CateringCompanies_CateringCompanyId",
                table: "MenuPeriods",
                column: "CateringCompanyId",
                principalTable: "CateringCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addons_CateringCompanies_CateringCompanyId",
                table: "Addons");

            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_CateringCompanies_CateringCompanyId",
                table: "Dishes");

            migrationBuilder.DropForeignKey(
                name: "FK_MenuPeriods_CateringCompanies_CateringCompanyId",
                table: "MenuPeriods");

            migrationBuilder.DropIndex(
                name: "IX_MenuPeriods_CateringCompanyId",
                table: "MenuPeriods");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_CateringCompanyId",
                table: "Dishes");

            migrationBuilder.DropIndex(
                name: "IX_Addons_CateringCompanyId",
                table: "Addons");

            migrationBuilder.DropColumn(
                name: "CateringCompanyId",
                table: "MenuPeriods");

            migrationBuilder.DropColumn(
                name: "CateringCompanyId",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "CateringCompanies");

            migrationBuilder.DropColumn(
                name: "CateringCompanyId",
                table: "Addons");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "MenuPeriods",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120);
        }
    }
}
