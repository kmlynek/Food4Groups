using Food4Groups.Application.DTOs.Orders;
using Food4Groups.Application.Interfaces.Orders;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Orders;

public class OrderService : IOrderService
{
    // Domyślny status przypisywany nowo utworzonemu zamówieniu
    private const string CreatedStatusName = "Created";
    
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderResponse>> GetAllAsync()
    {
        // Pracownik cateringu widzi zamówienia ze szczegółami potrzebnymi do przygotowania posiłków
        var orders = await GetOrdersQuery()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return await MapOrdersAsync(orders);
    }

    public async Task<List<OrderResponse>> GetMyOrdersAsync(string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        // Klient widzi wyłącznie zamówienia powiązane z jego członkostwem w grupie
        var orders = await GetOrdersQuery()
            .Where(x => x.GroupMember != null && x.GroupMember.UserId == currentUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return await MapOrdersAsync(orders);
    }
    
    public async Task<List<OrderResponse>> GetCoordinatorOrdersAsync(string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        // Koordynator widzi wyłącznie zamówienia grupy, do której został przypisany
        var orders = await GetOrdersQuery()
            .Where(x =>
                x.GroupMember != null &&
                x.GroupMember.Group != null &&
                x.GroupMember.Group.CoordinatorUserId == currentUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return await MapOrdersAsync(orders);
    }
    public async Task<OrderResponse?> GetByIdAsync(Guid id)
    {
        var order = await GetOrdersQuery()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order is null)
            return null;

        return (await MapOrdersAsync([order])).First();
    }

    public async Task<List<OrderStatusResponse>> GetStatusesAsync()
    {
        return await _context.OrderStatuses
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new OrderStatusResponse
            {
                Id = x.Id,
                Name = x.Name,
                IsFinal = x.IsFinal,
                IsActive = x.IsActive
            })
            .ToListAsync();
    }
    
     public async Task<OrderOptionsResponse> GetOptionsAsync(string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        var groupMember = await _context.GroupMembers
            .AsNoTracking()
            .Include(x => x.Group)
            .FirstOrDefaultAsync(x => x.UserId == currentUserId && x.IsActive);

        if (groupMember is null || groupMember.Group is null)
            return new OrderOptionsResponse();

        var orderedMenuDayIds = await _context.Orders
            .AsNoTracking()
            .Where(x => x.GroupMemberId == groupMember.Id)
            .Select(x => x.MenuDayId)
            .ToListAsync();

        // Klient otrzymuje tylko aktywne dni menu swojej firmy, dla których nie złożył jeszcze zamówienia
        var menuDays = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .Where(x =>
                x.IsActive &&
                x.MenuPeriod != null &&
                x.MenuPeriod.IsActive &&
                x.MenuPeriod.CateringCompanyId == groupMember.Group.CateringCompanyId &&
                !orderedMenuDayIds.Contains(x.Id))
            .OrderBy(x => x.MenuDate)
            .ToListAsync();

        var response = new OrderOptionsResponse
        {
            GroupMemberId = groupMember.Id,
            GroupId = groupMember.GroupId,
            GroupName = groupMember.Group.Name
        };

        foreach (var menuDay in menuDays)
        {
            var menuDate = menuDay.MenuDate.Date;

            var packageAssignment = await _context.GroupPackageAssignments
                .AsNoTracking()
                .Include(x => x.Package)
                .FirstOrDefaultAsync(x =>
                    x.GroupId == groupMember.GroupId &&
                    x.IsActive &&
                    x.Package != null &&
                    x.Package.IsActive &&
                    x.ActiveFrom.Date <= menuDate &&
                    (x.ActiveTo == null || x.ActiveTo.Value.Date >= menuDate));

            if (packageAssignment is null)
                continue;

            var dishes = await GetOrderOptionDishesAsync(menuDay.Id, packageAssignment.PackageId, groupMember.Group.CateringCompanyId);
            if (dishes.Count == 0)
                continue;

            var addons = await GetOrderOptionAddonsAsync(menuDay.Id, packageAssignment.PackageId, groupMember.Group.CateringCompanyId);

            response.MenuDays.Add(new OrderOptionMenuDayResponse
            {
                Id = menuDay.Id,
                MenuDate = menuDay.MenuDate,
                MenuPeriodName = menuDay.MenuPeriod?.Name,
                Dishes = dishes,
                Addons = addons
            });
        }

        return response;
    }

    public async Task<OrderResponse> CreateAsync(string currentUserId, CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        // Puste identyfikatory dodatków są pomijane, a duplikaty usuwane przed walidacją zamówienia
        var addonIds = request.AddonIds
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToList();

        var groupMember = await ValidateCustomerOrderRequestAsync(currentUserId, request.GroupMemberId, request.MenuDayId, request.DishId, addonIds);
        var createdStatus = await GetCreatedStatusAsync();

        var order = new Order
        {
            Id = Guid.NewGuid(),
            GroupMemberId = groupMember.Id,
            MenuDayId = request.MenuDayId,
            DishId = request.DishId,
            OrderStatusId = createdStatus.Id
        };

        _context.Orders.Add(order);

        foreach (var addonId in addonIds)
        {
            _context.OrderAddons.Add(new OrderAddon
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                AddonId = addonId
            });
        }

        // Historia statusów zapisuje moment utworzenia zamówienia oraz użytkownika wykonującego operację
        _context.OrderStatusHistories.Add(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            OrderStatusId = createdStatus.Id,
            ChangedByUserId = currentUserId
        });

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(order.Id))!;
    }

    public async Task<OrderResponse?> ChangeStatusAsync(Guid id, string changedByUserId, ChangeOrderStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(changedByUserId))
            throw new UnauthorizedAccessException("Sesja użytkownika wygasła. Zaloguj się ponownie.");

        if (request.OrderStatusId == Guid.Empty)
            throw new ArgumentException("Wybierz status zamówienia");

        var order = await _context.Orders
            .Include(x => x.OrderStatus)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (order is null)
            return null;

        // Status finalny blokuje dalszą zmianę zamówienia
        if (order.OrderStatus?.IsFinal == true)
            throw new InvalidOperationException("To zamówienie ma status końcowy. Nie można go już zmienić.");

        var newStatus = await _context.OrderStatuses
            .FirstOrDefaultAsync(x => x.Id == request.OrderStatusId);

        if (newStatus is null)
            throw new KeyNotFoundException("Nie znaleziono statusu zamówienia");

        if (!newStatus.IsActive)
            throw new InvalidOperationException("Nie można ustawić nieaktywnego statusu zamówienia");

        order.OrderStatusId = newStatus.Id;
        order.UpdatedAt = DateTime.UtcNow;

        // Każda zmiana statusu jest zapisywana w historii zamówienia
        _context.OrderStatusHistories.Add(new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            OrderStatusId = newStatus.Id,
            ChangedByUserId = changedByUserId
        });

        await _context.SaveChangesAsync();

        return await GetByIdAsync(order.Id);
    }

    private IQueryable<Order> GetOrdersQuery()
    {
        // Wspólne zapytanie pobiera relacje potrzebne do zbudowania odpowiedzi DTO
        return _context.Orders
            .AsNoTracking()
            .Include(x => x.GroupMember)
            .ThenInclude(x => x!.Group)
            .Include(x => x.MenuDay)
            .Include(x => x.Dish)
            .Include(x => x.OrderStatus);
    }

    private async Task<List<OrderResponse>> MapOrdersAsync(List<Order> orders)
    {
        var orderIds = orders.Select(x => x.Id).ToList();

        var userIds = orders
            .Where(x => x.GroupMember != null)
            .Select(x => x.GroupMember!.UserId)
            .Distinct()
            .ToList();

        // Dane użytkowników są pobierane zbiorczo, aby uniknąć osobnych zapytań dla każdego zamówienia
        var userEmails = await _context.Users
            .AsNoTracking()
            .Where(x => userIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.Email);

        // Dodatki do zamówień są pobierane zbiorczo dla całej listy zamówień
        var orderAddons = await _context.OrderAddons
            .AsNoTracking()
            .Include(x => x.Addon)
            .Where(x => orderIds.Contains(x.OrderId))
            .ToListAsync();

        // Historia statusów jest pobierana zbiorczo i sortowana chronologicznie
        var statusHistory = await _context.OrderStatusHistories
            .AsNoTracking()
            .Include(x => x.OrderStatus)
            .Where(x => orderIds.Contains(x.OrderId))
            .OrderBy(x => x.ChangedAt)
            .ToListAsync();

        return orders.Select(order => new OrderResponse
        {
            Id = order.Id,
            GroupMemberId = order.GroupMemberId,
            CustomerEmail = order.GroupMember != null && userEmails.TryGetValue(order.GroupMember.UserId, out var email) ? email : null,
            GroupId = order.GroupMember?.GroupId ?? Guid.Empty,
            GroupName = order.GroupMember?.Group?.Name,
            MenuDayId = order.MenuDayId,
            MenuDate = order.MenuDay?.MenuDate,
            DishId = order.DishId,
            DishName = order.Dish?.Name,
            OrderStatusId = order.OrderStatusId,
            OrderStatusName = order.OrderStatus?.Name,
            Addons = orderAddons
                .Where(x => x.OrderId == order.Id)
                .Select(x => new OrderAddonResponse
                {
                    AddonId = x.AddonId,
                    AddonName = x.Addon?.Name
                })
                .ToList(),
            StatusHistory = statusHistory
                .Where(x => x.OrderId == order.Id)
                .Select(x => new OrderStatusHistoryResponse
                {
                    OrderStatusId = x.OrderStatusId,
                    OrderStatusName = x.OrderStatus?.Name,
                    ChangedByUserId = x.ChangedByUserId,
                    ChangedAt = x.ChangedAt
                })
                .ToList(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        }).ToList();
    }

    private async Task<List<OrderOptionDishResponse>> GetOrderOptionDishesAsync(Guid menuDayId, Guid packageId, Guid cateringCompanyId)
    {
        // Dostępne dania muszą być jednocześnie w menu dnia i w pakiecie przypisanym do grupy
        return await (
            from menuItem in _context.MenuItems.AsNoTracking()
            join dish in _context.Dishes.AsNoTracking() on menuItem.DishId equals dish.Id
            join packageDish in _context.PackageDishes.AsNoTracking() on dish.Id equals packageDish.DishId
            where menuItem.MenuDayId == menuDayId &&
                  menuItem.IsActive &&
                  dish.IsActive &&
                  dish.CateringCompanyId == cateringCompanyId &&
                  packageDish.PackageId == packageId &&
                  packageDish.IsActive
            orderby dish.Name
            select new OrderOptionDishResponse
            {
                Id = dish.Id,
                Name = dish.Name
            })
            .Distinct()
            .ToListAsync();
    }

    private async Task<List<OrderOptionAddonResponse>> GetOrderOptionAddonsAsync(Guid menuDayId, Guid packageId, Guid cateringCompanyId)
    {
        // Dostępne dodatki muszą być jednocześnie w menu dnia i w pakiecie przypisanym do grupy
        return await (
            from menuDayAddon in _context.MenuDayAddons.AsNoTracking()
            join addon in _context.Addons.AsNoTracking() on menuDayAddon.AddonId equals addon.Id
            join packageAddon in _context.PackageAddons.AsNoTracking() on addon.Id equals packageAddon.AddonId
            where menuDayAddon.MenuDayId == menuDayId &&
                  menuDayAddon.IsActive &&
                  addon.IsActive &&
                  addon.CateringCompanyId == cateringCompanyId &&
                  packageAddon.PackageId == packageId &&
                  packageAddon.IsActive
            orderby addon.Name
            select new OrderOptionAddonResponse
            {
                Id = addon.Id,
                Name = addon.Name
            })
            .Distinct()
            .ToListAsync();
    }
    private async Task<GroupMember> ValidateCustomerOrderRequestAsync(
        string currentUserId,
        Guid groupMemberId,
        Guid menuDayId,
        Guid dishId,
        List<Guid> addonIds)
    {
        if (groupMemberId == Guid.Empty)
            throw new ArgumentException("Konto nie jest przypisane do grupy");

        if (menuDayId == Guid.Empty)
            throw new ArgumentException("Wybierz dzień menu");

        if (dishId == Guid.Empty)
            throw new ArgumentException("Wybierz danie");

        var groupMember = await _context.GroupMembers
            .Include(x => x.Group)
            .FirstOrDefaultAsync(x => x.Id == groupMemberId);

        if (groupMember is null)
            throw new KeyNotFoundException("Nie znaleziono uczestnika grupy");

        if (!groupMember.IsActive)
            throw new InvalidOperationException("Nieaktywne uczestnictwo nie pozwala składać zamówień");

        // Użytkownik może utworzyć zamówienie wyłącznie dla własnego członkostwa w grupie
        if (groupMember.UserId != currentUserId)
            throw new UnauthorizedAccessException("Nie możesz złożyć zamówienia za innego uczestnika grupy");

        if (groupMember.Group is null)
            throw new InvalidOperationException("Konto nie jest przypisane do grupy");

        var menuDay = await _context.MenuDays
            .Include(x => x.MenuPeriod)
            .FirstOrDefaultAsync(x => x.Id == menuDayId);

        if (menuDay is null)
            throw new KeyNotFoundException("Nie znaleziono dnia menu");

        if (!menuDay.IsActive)
            throw new InvalidOperationException("Nie można złożyć zamówienia na nieaktywny dzień menu");

        if (menuDay.MenuPeriod is null || !menuDay.MenuPeriod.IsActive)
            throw new InvalidOperationException("Nie można złożyć zamówienia w nieaktywnym okresie menu");

        var menuDate = menuDay.MenuDate.Date;

        // Grupa musi mieć aktywny pakiet obowiązujący w dniu wybranego menu
        var packageAssignment = await _context.GroupPackageAssignments
            .Include(x => x.Package)
            .FirstOrDefaultAsync(x =>
                x.GroupId == groupMember.GroupId &&
                x.IsActive &&
                x.ActiveFrom.Date <= menuDate &&
                (x.ActiveTo == null || x.ActiveTo.Value.Date >= menuDate));

        if (packageAssignment is null || packageAssignment.Package is null)
            throw new InvalidOperationException("Grupa nie ma aktywnego pakietu dla wybranego dnia menu");

        if (!packageAssignment.Package.IsActive)
            throw new InvalidOperationException("Nie można złożyć zamówienia z nieaktywnego pakietu");

        // Grupa, pakiet i menu muszą należeć do tej samej firmy cateringowej
        if (groupMember.Group.CateringCompanyId != menuDay.MenuPeriod.CateringCompanyId ||
            packageAssignment.Package.CateringCompanyId != menuDay.MenuPeriod.CateringCompanyId)
            throw new InvalidOperationException("Grupa, pakiet i dzień menu muszą należeć do tej samej firmy cateringowej");

        await EnsureDishCanBeOrderedAsync(packageAssignment.PackageId, menuDay.Id, dishId, menuDay.MenuPeriod.CateringCompanyId);
        await EnsureAddonsCanBeOrderedAsync(packageAssignment.PackageId, menuDay.Id, addonIds, menuDay.MenuPeriod.CateringCompanyId);
        await EnsureOrderDoesNotExistAsync(groupMember.Id, menuDay.Id);

        return groupMember;
    }

    private async Task EnsureDishCanBeOrderedAsync(Guid packageId, Guid menuDayId, Guid dishId, Guid cateringCompanyId)
    {
        var dish = await _context.Dishes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dishId);

        if (dish is null)
            throw new KeyNotFoundException("Nie znaleziono dania");

        if (!dish.IsActive)
            throw new InvalidOperationException("Nie można zamówić nieaktywnego dania");

        if (dish.CateringCompanyId != cateringCompanyId)
            throw new InvalidOperationException("Wybrane danie należy do innej firmy cateringowej");

        // Danie musi być dostępne w wybranym dniu menu
        var dishInMenu = await _context.MenuItems
            .AnyAsync(x => x.MenuDayId == menuDayId && x.DishId == dishId && x.IsActive);

        if (!dishInMenu)
            throw new InvalidOperationException("Wybrane danie nie jest dostępne w tym dniu menu");

        // Danie musi być dozwolone w pakiecie przypisanym do grupy
        var dishInPackage = await _context.PackageDishes
            .AnyAsync(x => x.PackageId == packageId && x.DishId == dishId && x.IsActive);

        if (!dishInPackage)
            throw new InvalidOperationException("Wybrane danie nie jest dostępne w pakiecie grupy");
    }

    private async Task EnsureAddonsCanBeOrderedAsync(Guid packageId, Guid menuDayId, List<Guid> addonIds, Guid cateringCompanyId)
    {
        foreach (var addonId in addonIds)
        {
            var addon = await _context.Addons
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == addonId);

            if (addon is null)
                throw new KeyNotFoundException("Nie znaleziono dodatku");

            if (!addon.IsActive)
                throw new InvalidOperationException("Nie można zamówić nieaktywnego dodatku");

            if (addon.CateringCompanyId != cateringCompanyId)
                throw new InvalidOperationException("Wybrany dodatek należy do innej firmy cateringowej");

            // Dodatek musi być dostępny w wybranym dniu menu
            var addonInMenu = await _context.MenuDayAddons
                .AnyAsync(x => x.MenuDayId == menuDayId && x.AddonId == addonId && x.IsActive);

            if (!addonInMenu)
                throw new InvalidOperationException("Wybrany dodatek nie jest dostępny w tym dniu menu");

            // Dodatek musi być dozwolony w pakiecie przypisanym do grupy
            var addonInPackage = await _context.PackageAddons
                .AnyAsync(x => x.PackageId == packageId && x.AddonId == addonId && x.IsActive);

            if (!addonInPackage)
                throw new InvalidOperationException("Wybrany dodatek nie jest dostępny w pakiecie grupy");
        }
    }

    private async Task EnsureOrderDoesNotExistAsync(Guid groupMemberId, Guid menuDayId)
    {
        // Użytkownik może złożyć tylko jedno zamówienie na dany dzień menu
        var exists = await _context.Orders
            .AnyAsync(x => x.GroupMemberId == groupMemberId && x.MenuDayId == menuDayId);

        if (exists)
            throw new InvalidOperationException("Zamówienie na ten dzień menu zostało już złożone");
    }

    private async Task<OrderStatus> GetCreatedStatusAsync()
    {
        // Status początkowy musi być skonfigurowany w słowniku statusów zamówień
        var status = await _context.OrderStatuses
            .FirstOrDefaultAsync(x => x.Name == CreatedStatusName && x.IsActive);

        if (status is null)
            throw new InvalidOperationException("Nie skonfigurowano początkowego statusu zamówienia");

        return status;
    }
}
