using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Food4Groups.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupCoordinator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoordinatorUserId",
                table: "Groups",
                type: "character varying(458)",
                maxLength: 458,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CoordinatorUserId",
                table: "Groups",
                column: "CoordinatorUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_AspNetUsers_CoordinatorUserId",
                table: "Groups",
                column: "CoordinatorUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Groups_AspNetUsers_CoordinatorUserId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_Groups_CoordinatorUserId",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "CoordinatorUserId",
                table: "Groups");
        }
    }
}
