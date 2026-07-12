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
            throw new ArgumentException("Wybierz grupę");

        if (dateFrom == default)
            throw new ArgumentException("Podaj datę początkową");

        if (dateTo == default)
            throw new ArgumentException("Podaj datę końcową");

        if (dateTo.Date < dateFrom.Date)
            throw new ArgumentException("Data końcowa nie może być wcześniejsza niż data początkowa");

        var reportDateFrom = DateTime.SpecifyKind(dateFrom.Date, DateTimeKind.Utc);
        var reportDateTo = DateTime.SpecifyKind(dateTo.Date, DateTimeKind.Utc);

        var group = await _context.Groups
            .AsNoTracking()
            .Include(x => x.CateringCompany)
            .FirstOrDefaultAsync(x => x.Id == groupId);

        if (group is null)
            throw new KeyNotFoundException("Nie znaleziono grupy");

        var template = await GetActiveTemplateAsync(GroupSettlementProformaTemplateCode);
        var reportRows = await GetGroupSettlementRowsAsync(groupId, reportDateFrom, reportDateTo);

        var totalMenuDays = reportRows.Count;
        var totalParticipants = reportRows.FirstOrDefault()?.MemberCount ?? 0;
        var totalSubscriptionUnits = reportRows.Sum(x => x.MemberCount);
        var totalAmount = reportRows.Sum(x => x.TotalAmount);
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
            ["DateFrom"] = FormatDate(reportDateFrom),
            ["DateTo"] = FormatDate(reportDateTo),
            ["TotalOrders"] = totalSubscriptionUnits.ToString(PolishCulture),
            ["TotalMenuDays"] = totalMenuDays.ToString(PolishCulture),
            ["TotalParticipants"] = totalParticipants.ToString(PolishCulture),
            ["TotalSubscriptionUnits"] = totalSubscriptionUnits.ToString(PolishCulture),
            ["TotalAmount"] = FormatMoney(totalAmount),
            ["PackageName"] = packageNames.Count > 0 ? string.Join(", ", packageNames) : "Brak pakietu"
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
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("Data");
                                header.Cell().Element(HeaderCell).Text("Pakiet");
                                header.Cell().Element(HeaderCell).Text("Uczestnicy");
                                header.Cell().Element(HeaderCell).AlignRight().Text("Cena");
                                header.Cell().Element(HeaderCell).AlignRight().Text("Kwota");
                            });

                            foreach (var row in reportRows)
                            {
                                table.Cell().Element(BodyCell).Text(FormatDate(row.MenuDate));
                                table.Cell().Element(BodyCell).Text(row.PackageName);
                                table.Cell().Element(BodyCell).Text(row.MemberCount.ToString(PolishCulture));
                                table.Cell().Element(BodyCell).AlignRight().Text(FormatMoney(row.PricePerPerson));
                                table.Cell().Element(BodyCell).AlignRight().Text(FormatMoney(row.TotalAmount));
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
            FileName = $"proforma-{group.Name}-{reportDateFrom:yyyyMMdd}-{reportDateTo:yyyyMMdd}.pdf",
            ContentType = "application/pdf",
            Content = pdf
        };
    }

    public async Task<ReportFileResponse> GenerateCoordinatorGroupSettlementProformaPdfAsync(string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        var currentDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        // Koordynator otrzymuje pełną proformę dla aktualnego pakietu przypisanego do jego grupy
        var packageAssignment = await _context.GroupPackageAssignments
            .AsNoTracking()
            .Include(x => x.Group)
            .Include(x => x.Package)
            .Where(x =>
                x.IsActive &&
                x.Group != null &&
                x.Group.CoordinatorUserId == currentUserId &&
                x.Package != null &&
                x.Package.IsActive &&
                x.ActiveFrom.Date <= currentDate &&
                (x.ActiveTo == null || x.ActiveTo.Value.Date >= currentDate))
            .OrderByDescending(x => x.ActiveFrom)
            .FirstOrDefaultAsync();

        if (packageAssignment is null || packageAssignment.Group is null)
            throw new KeyNotFoundException("Grupa nie ma aktualnie przypisanego aktywnego pakietu");

        var dateFrom = packageAssignment.ActiveFrom;
        var dateTo = packageAssignment.ActiveTo ?? await GetLastMenuDayDateAsync(packageAssignment.Group.CateringCompanyId, dateFrom);

        return await GenerateGroupSettlementProformaPdfAsync(packageAssignment.GroupId, dateFrom, dateTo);
    }

    public async Task<ReportFileResponse> GenerateDailyOrdersExcelAsync(Guid menuDayId)
    {
        if (menuDayId == Guid.Empty)
            throw new ArgumentException("Wybierz dzień menu");

        var menuDay = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .ThenInclude(x => x!.CateringCompany)
            .FirstOrDefaultAsync(x => x.Id == menuDayId);

        if (menuDay is null)
            throw new KeyNotFoundException("Nie znaleziono dnia menu");

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
            throw new InvalidOperationException("Nie skonfigurowano szablonu dokumentu");

        return template;
    }

    private async Task<DateTime> GetLastMenuDayDateAsync(Guid cateringCompanyId, DateTime dateFrom)
    {
        // Otwarty pakiet koordynatora kończy raport na ostatnim aktywnym dniu menu dostępnym w systemie
        var lastMenuDay = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .Where(x =>
                x.IsActive &&
                x.MenuPeriod != null &&
                x.MenuPeriod.IsActive &&
                x.MenuPeriod.CateringCompanyId == cateringCompanyId &&
                x.MenuDate.Date >= dateFrom.Date)
            .OrderByDescending(x => x.MenuDate)
            .Select(x => (DateTime?)x.MenuDate)
            .FirstOrDefaultAsync();

        if (!lastMenuDay.HasValue)
            throw new InvalidOperationException("Brak aktywnych dni menu dla pakietu grupy");

        return DateTime.SpecifyKind(lastMenuDay.Value.Date, DateTimeKind.Utc);
    }

    private async Task<List<GroupSettlementReportRow>> GetGroupSettlementRowsAsync(Guid groupId, DateTime dateFrom, DateTime dateTo)
    {
        // Proforma abonamentowa jest liczona na podstawie dni menu, uczestników grupy i aktywnego pakietu
        var memberCount = await _context.GroupMembers
            .AsNoTracking()
            .CountAsync(x => x.GroupId == groupId && x.IsActive);

        var group = await _context.Groups
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == groupId);

        if (group is null)
            throw new KeyNotFoundException("Nie znaleziono grupy");

        var menuDays = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .Where(x =>
                x.IsActive &&
                x.MenuPeriod != null &&
                x.MenuPeriod.IsActive &&
                x.MenuPeriod.CateringCompanyId == group.CateringCompanyId &&
                x.MenuDate.Date >= dateFrom &&
                x.MenuDate.Date <= dateTo)
            .OrderBy(x => x.MenuDate)
            .ToListAsync();

        var rows = new List<GroupSettlementReportRow>();

        foreach (var menuDay in menuDays)
        {
            // Cena w raporcie pochodzi z pakietu aktywnego dla grupy w danym dniu menu
            var packageAssignment = await _context.GroupPackageAssignments
                .AsNoTracking()
                .Include(x => x.Package)
                .FirstOrDefaultAsync(x =>
                    x.GroupId == groupId &&
                    x.IsActive &&
                    x.Package != null &&
                    x.Package.IsActive &&
                    x.ActiveFrom.Date <= menuDay.MenuDate.Date &&
                    (x.ActiveTo == null || x.ActiveTo.Value.Date >= menuDay.MenuDate.Date));

            var pricePerPerson = packageAssignment?.Package?.PricePerPerson ?? 0;

            rows.Add(new GroupSettlementReportRow(
                menuDay.MenuDate,
                packageAssignment?.Package?.Name ?? "Brak pakietu",
                memberCount,
                pricePerPerson,
                memberCount * pricePerPerson));
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
        string PackageName,
        int MemberCount,
        decimal PricePerPerson,
        decimal TotalAmount);
}
