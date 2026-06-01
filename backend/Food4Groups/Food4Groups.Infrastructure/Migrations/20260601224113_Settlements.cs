using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Food4Groups.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Settlements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SettlementPeriods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CateringCompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettlementPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SettlementPeriods_CateringCompanies_CateringCompanyId",
                        column: x => x.CateringCompanyId,
                        principalTable: "CateringCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupSettlements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SettlementPeriodId = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrdersCount = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupSettlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupSettlements_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupSettlements_SettlementPeriods_SettlementPeriodId",
                        column: x => x.SettlementPeriodId,
                        principalTable: "SettlementPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SettlementLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupSettlementId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackagePrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    AddonsPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettlementLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SettlementLines_GroupSettlements_GroupSettlementId",
                        column: x => x.GroupSettlementId,
                        principalTable: "GroupSettlements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SettlementLines_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupSettlements_GroupId",
                table: "GroupSettlements",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupSettlements_SettlementPeriodId_GroupId",
                table: "GroupSettlements",
                columns: new[] { "SettlementPeriodId", "GroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SettlementLines_GroupSettlementId_OrderId",
                table: "SettlementLines",
                columns: new[] { "GroupSettlementId", "OrderId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SettlementLines_OrderId",
                table: "SettlementLines",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_SettlementPeriods_CateringCompanyId_StartDate_EndDate",
                table: "SettlementPeriods",
                columns: new[] { "CateringCompanyId", "StartDate", "EndDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SettlementLines");

            migrationBuilder.DropTable(
                name: "GroupSettlements");

            migrationBuilder.DropTable(
                name: "SettlementPeriods");
        }
    }
}
