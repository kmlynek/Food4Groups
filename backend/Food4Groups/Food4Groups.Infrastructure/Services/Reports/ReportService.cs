using System.Globalization;
using ClosedXML.Excel;
using Food4Groups.Application.DTOs.Reports;
using Food4Groups.Application.Interfaces.Reports;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Food4Groups.Infrastructure.Services.Reports;

public class ReportService : IReportService
{
    private const string GroupSettlementProformaTemplateCode = "GroupSettlementProforma";
    private static readonly CultureInfo PolishCulture = new("pl-PL");

    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReportFileResponse> GenerateGroupSettlementProformaPdfAsync(Guid groupId, DateTime dateFrom, DateTime dateTo)
    {
        // Raport rozliczeniowy może zostać wygenerowany wyłącznie dla wskazanej grupy i poprawnego zakresu dat
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required");

        if (dateFrom == default)
            throw new ArgumentException("DateFrom is required");

        if (dateTo == default)
            throw new ArgumentException("DateTo is required");

        if (dateTo.Date < dateFrom.Date)
            throw new ArgumentException("DateTo cannot be earlier than DateFrom");

        var group = await _context.Groups
            .AsNoTracking()
            .Include(x => x.CateringCompany)
            .FirstOrDefaultAsync(x => x.Id == groupId);

        if (group is null)
            throw new KeyNotFoundException("Group not found");

        var template = await GetActiveTemplateAsync(GroupSettlementProformaTemplateCode);
        var reportRows = await GetGroupSettlementRowsAsync(groupId, dateFrom.Date, dateTo.Date);

        var totalOrders = reportRows.Count;
        var totalAmount = reportRows.Sum(x => x.PackagePrice);
        var packageNames = reportRows
            .Select(x => x.PackageName)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        // Dane raportu są podstawiane do aktywnego szablonu wydruku przechowywanego w bazie
        var replacements = new Dictionary<string, string>
        {
            ["GroupName"] = group.Name,
            ["CateringCompanyName"] = group.CateringCompany?.Name ?? string.Empty,
            ["DateFrom"] = FormatDate(dateFrom),
            ["DateTo"] = FormatDate(dateTo),
            ["TotalOrders"] = totalOrders.ToString(PolishCulture),
            ["TotalAmount"] = FormatMoney(totalAmount),
            ["PackageName"] = packageNames.Count > 0 ? string.Join(", ", packageNames) : "Brak zamówień"
        };

        var title = ApplyTemplate(template.TitleTemplate, replacements);
        var body = ApplyTemplate(template.BodyTemplate, replacements);
        var footer = ApplyTemplate(template.FooterTemplate, replacements);

        // QuestPDF generuje dokument PDF na podstawie danych rozliczeniowych oraz szablonu wydruku
        var pdf = Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(35);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Column(column =>
                    {
                        column.Item().Text(title).FontSize(18).Bold();
                        column.Item().Text(group.CateringCompany?.Name ?? "Food4Groups").FontSize(11).FontColor(Colors.Grey.Darken2);
                    });

                page.Content()
                    .PaddingVertical(20)
                    .Column(column =>
                    {
                        column.Spacing(12);
                        column.Item().Text(body);

                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("Data");
                                header.Cell().Element(HeaderCell).Text("Klient");
                                header.Cell().Element(HeaderCell).Text("Danie");
                                header.Cell().Element(HeaderCell).Text("Pakiet");
                                header.Cell().Element(HeaderCell).AlignRight().Text("Kwota");
                            });

                            foreach (var row in reportRows)
                            {
                                table.Cell().Element(BodyCell).Text(FormatDate(row.MenuDate));
                                table.Cell().Element(BodyCell).Text(row.CustomerEmail);
                                table.Cell().Element(BodyCell).Text(row.DishName);
                                table.Cell().Element(BodyCell).Text(row.PackageName);
                                table.Cell().Element(BodyCell).AlignRight().Text(FormatMoney(row.PackagePrice));
                            }
                        });

                        column.Item()
                            .AlignRight()
                            .Text($"Razem: {FormatMoney(totalAmount)}")
                            .FontSize(14)
                            .Bold();
                    });

                page.Footer()
                    .Column(column =>
                    {
                        column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                        column.Item().PaddingTop(6).Text(footer).FontSize(9).FontColor(Colors.Grey.Darken2);
                    });
            });
        }).GeneratePdf();

        return new ReportFileResponse
        {
            FileName = $"proforma-{group.Name}-{dateFrom:yyyyMMdd}-{dateTo:yyyyMMdd}.pdf",
            ContentType = "application/pdf",
            Content = pdf
        };
    }
    
    public async Task<ReportFileResponse> GenerateCoordinatorGroupSettlementProformaPdfAsync(string currentUserId, DateTime dateFrom, DateTime dateTo)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("User is not authenticated");

        // Koordynator może wygenerować proformę wyłącznie dla grupy przypisanej do jego konta
        var groupId = await _context.Groups
            .AsNoTracking()
            .Where(x => x.CoordinatorUserId == currentUserId)
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (groupId == Guid.Empty)
            throw new KeyNotFoundException("Coordinator group not found");

        return await GenerateGroupSettlementProformaPdfAsync(groupId, dateFrom, dateTo);
    }

    public async Task<ReportFileResponse> GenerateDailyOrdersExcelAsync(Guid menuDayId)
    {
        if (menuDayId == Guid.Empty)
            throw new ArgumentException("MenuDayId is required");

        var menuDay = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .ThenInclude(x => x!.CateringCompany)
            .FirstOrDefaultAsync(x => x.Id == menuDayId);

        if (menuDay is null)
            throw new KeyNotFoundException("Menu day not found");

        // Raport dzienny obejmuje wszystkie zamówienia złożone dla wskazanego dnia menu
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(x => x.GroupMember)
            .ThenInclude(x => x!.Group)
            .Include(x => x.Dish)
            .Include(x => x.OrderStatus)
            .Where(x => x.MenuDayId == menuDayId)
            .OrderBy(x => x.GroupMember!.Group!.Name)
            .ThenBy(x => x.Dish!.Name)
            .ToListAsync();

        var orderIds = orders.Select(x => x.Id).ToList();
        var userIds = orders.Select(x => x.GroupMember!.UserId).Distinct().ToList();

        var userEmails = await _context.Users
            .AsNoTracking()
            .Where(x => userIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.Email);

        var orderAddons = await _context.OrderAddons
            .AsNoTracking()
            .Include(x => x.Addon)
            .Where(x => orderIds.Contains(x.OrderId))
            .ToListAsync();

        // ClosedXML generuje arkusz Excel wykorzystywany operacyjnie przez pracownika cateringu
        using var workbook = new XLWorkbook();
        var worksheet = workbook.AddWorksheet("Zamówienia");

        worksheet.Cell(1, 1).Value = "Dzienny raport zamówień";
        worksheet.Range(1, 1, 1, 7).Merge().Style.Font.Bold = true;
        worksheet.Cell(2, 1).Value = "Data";
        worksheet.Cell(2, 2).Value = FormatDate(menuDay.MenuDate);
        worksheet.Cell(3, 1).Value = "Firma cateringowa";
        worksheet.Cell(3, 2).Value = menuDay.MenuPeriod?.CateringCompany?.Name ?? string.Empty;

        var headerRow = 5;
        worksheet.Cell(headerRow, 1).Value = "Grupa";
        worksheet.Cell(headerRow, 2).Value = "Klient";
        worksheet.Cell(headerRow, 3).Value = "Danie";
        worksheet.Cell(headerRow, 4).Value = "Dodatki";
        worksheet.Cell(headerRow, 5).Value = "Status";
        worksheet.Cell(headerRow, 6).Value = "Utworzono";
        worksheet.Cell(headerRow, 7).Value = "Id zamówienia";
        worksheet.Range(headerRow, 1, headerRow, 7).Style.Font.Bold = true;

        var rowNumber = headerRow + 1;
        foreach (var order in orders)
        {
            var addons = orderAddons
                .Where(x => x.OrderId == order.Id)
                .Select(x => x.Addon?.Name)
                .Where(x => !string.IsNullOrWhiteSpace(x));

            worksheet.Cell(rowNumber, 1).Value = order.GroupMember?.Group?.Name ?? string.Empty;
            worksheet.Cell(rowNumber, 2).Value = order.GroupMember != null && userEmails.TryGetValue(order.GroupMember.UserId, out var email) ? email : string.Empty;
            worksheet.Cell(rowNumber, 3).Value = order.Dish?.Name ?? string.Empty;
            worksheet.Cell(rowNumber, 4).Value = string.Join(", ", addons);
            worksheet.Cell(rowNumber, 5).Value = order.OrderStatus?.Name ?? string.Empty;
            worksheet.Cell(rowNumber, 6).Value = order.CreatedAt.ToString("yyyy-MM-dd HH:mm", PolishCulture);
            worksheet.Cell(rowNumber, 7).Value = order.Id.ToString();
            rowNumber++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new ReportFileResponse
        {
            FileName = $"zamowienia-{menuDay.MenuDate:yyyyMMdd}.xlsx",
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            Content = stream.ToArray()
        };
    }

    private async Task<PrintTemplate> GetActiveTemplateAsync(string code)
    {
        // Raport PDF wymaga aktywnego szablonu wydruku o określonym kodzie
        var template = await _context.PrintTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == code && x.IsActive);

        if (template is null)
            throw new InvalidOperationException("Print template is not configured");

        return template;
    }

    private async Task<List<GroupSettlementReportRow>> GetGroupSettlementRowsAsync(Guid groupId, DateTime dateFrom, DateTime dateTo)
    {
        // Dane rozliczeniowe są budowane na podstawie zamówień grupy z wybranego zakresu dat
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(x => x.GroupMember)
            .Include(x => x.MenuDay)
            .Include(x => x.Dish)
            .Where(x =>
                x.GroupMember != null &&
                x.GroupMember.GroupId == groupId &&
                x.MenuDay != null &&
                x.MenuDay.MenuDate.Date >= dateFrom &&
                x.MenuDay.MenuDate.Date <= dateTo)
            .OrderBy(x => x.MenuDay!.MenuDate)
            .ToListAsync();

        var userIds = orders.Select(x => x.GroupMember!.UserId).Distinct().ToList();
        var userEmails = await _context.Users
            .AsNoTracking()
            .Where(x => userIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.Email);

        var rows = new List<GroupSettlementReportRow>();

        foreach (var order in orders)
        {
            // Cena w raporcie pochodzi z pakietu aktywnego dla grupy w dniu zamówienia
            var packageAssignment = await _context.GroupPackageAssignments
                .AsNoTracking()
                .Include(x => x.Package)
                .FirstOrDefaultAsync(x =>
                    x.GroupId == groupId &&
                    x.IsActive &&
                    x.ActiveFrom.Date <= order.MenuDay!.MenuDate.Date &&
                    (x.ActiveTo == null || x.ActiveTo.Value.Date >= order.MenuDay!.MenuDate.Date));

            rows.Add(new GroupSettlementReportRow(
                order.MenuDay!.MenuDate,
                userEmails.TryGetValue(order.GroupMember!.UserId, out var email) ? email ?? string.Empty : string.Empty,
                order.Dish?.Name ?? string.Empty,
                packageAssignment?.Package?.Name ?? "Brak pakietu",
                packageAssignment?.Package?.PricePerPerson ?? 0));
        }

        return rows;
    }

    private static string ApplyTemplate(string template, Dictionary<string, string> values)
    {
        // Zmienne szablonu są zastępowane wartościami wyliczonymi dla konkretnego raportu
        var result = template;

        foreach (var value in values)
        {
            result = result.Replace("{{" + value.Key + "}}", value.Value);
        }

        return result;
    }

    private static string FormatDate(DateTime date)
    {
        return date.ToString("yyyy-MM-dd", PolishCulture);
    }

    private static string FormatMoney(decimal value)
    {
        return value.ToString("C", PolishCulture);
    }

    private static IContainer HeaderCell(IContainer container)
    {
        return container
            .Background(Colors.Grey.Lighten3)
            .Border(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Padding(5);
    }

    private static IContainer BodyCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(5);
    }

    private record GroupSettlementReportRow(
        DateTime MenuDate,
        string CustomerEmail,
        string DishName,
        string PackageName,
        decimal PackagePrice);
}