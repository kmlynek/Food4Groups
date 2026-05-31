using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Food4Groups.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupPackageAndMenuManagment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CateringCompanyId",
                table: "Packages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Packages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CateringCompanyId",
                table: "Groups",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CateringCompanies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CateringCompanies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupPackageAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupPackageAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupPackageAssignments_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupPackageAssignments_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MenuPeriods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuPeriods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PackageAddons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddonId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageAddons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageAddons_Addons_AddonId",
                        column: x => x.AddonId,
                        principalTable: "Addons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageAddons_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageDishes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    DishId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageDishes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageDishes_Dishes_DishId",
                        column: x => x.DishId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageDishes_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MenuDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuPeriodId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuDays_MenuPeriods_MenuPeriodId",
                        column: x => x.MenuPeriodId,
                        principalTable: "MenuPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MenuDayAddons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddonId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuDayAddons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuDayAddons_Addons_AddonId",
                        column: x => x.AddonId,
                        principalTable: "Addons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MenuDayAddons_MenuDays_MenuDayId",
                        column: x => x.MenuDayId,
                        principalTable: "MenuDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    DishId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuItems_Dishes_DishId",
                        column: x => x.DishId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MenuItems_MenuDays_MenuDayId",
                        column: x => x.MenuDayId,
                        principalTable: "MenuDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Packages_CateringCompanyId",
                table: "Packages",
                column: "CateringCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CateringCompanyId",
                table: "Groups",
                column: "CateringCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupPackageAssignments_GroupId_PackageId_ActiveFrom",
                table: "GroupPackageAssignments",
                columns: new[] { "GroupId", "PackageId", "ActiveFrom" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupPackageAssignments_PackageId",
                table: "GroupPackageAssignments",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuDayAddons_AddonId",
                table: "MenuDayAddons",
                column: "AddonId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuDayAddons_MenuDayId_AddonId",
                table: "MenuDayAddons",
                columns: new[] { "MenuDayId", "AddonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MenuDays_MenuPeriodId_MenuDate",
                table: "MenuDays",
                columns: new[] { "MenuPeriodId", "MenuDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_DishId",
                table: "MenuItems",
                column: "DishId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_MenuDayId_DishId",
                table: "MenuItems",
                columns: new[] { "MenuDayId", "DishId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PackageAddons_AddonId",
                table: "PackageAddons",
                column: "AddonId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageAddons_PackageId_AddonId",
                table: "PackageAddons",
                columns: new[] { "PackageId", "AddonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PackageDishes_DishId",
                table: "PackageDishes",
                column: "DishId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageDishes_PackageId_DishId",
                table: "PackageDishes",
                columns: new[] { "PackageId", "DishId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_CateringCompanies_CateringCompanyId",
                table: "Groups",
                column: "CateringCompanyId",
                principalTable: "CateringCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Packages_CateringCompanies_CateringCompanyId",
                table: "Packages",
                column: "CateringCompanyId",
                principalTable: "CateringCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Groups_CateringCompanies_CateringCompanyId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_Packages_CateringCompanies_CateringCompanyId",
                table: "Packages");

            migrationBuilder.DropTable(
                name: "CateringCompanies");

            migrationBuilder.DropTable(
                name: "GroupPackageAssignments");

            migrationBuilder.DropTable(
                name: "MenuDayAddons");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "PackageAddons");

            migrationBuilder.DropTable(
                name: "PackageDishes");

            migrationBuilder.DropTable(
                name: "MenuDays");

            migrationBuilder.DropTable(
                name: "MenuPeriods");

            migrationBuilder.DropIndex(
                name: "IX_Packages_CateringCompanyId",
                table: "Packages");

            migrationBuilder.DropIndex(
                name: "IX_Groups_CateringCompanyId",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "CateringCompanyId",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "CateringCompanyId",
                table: "Groups");
        }
    }
}
