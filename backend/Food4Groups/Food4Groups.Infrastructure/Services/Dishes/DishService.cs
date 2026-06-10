using Food4Groups.Application.DTOs.Dishes;
using Food4Groups.Application.Interfaces.Dishes;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Dishes;

public class DishService : IDishService
{
    private readonly ApplicationDbContext _context;

    public DishService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActiveDishResponse>> GetAllActiveAsync()
    {
        // Użytkownicy końcowi otrzymują wyłącznie aktywne dania oraz ograniczony zakres danych potrzebny do wyboru posiłku
        return await _context.Dishes
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new ActiveDishResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .ToListAsync();
    }

    public async Task<List<DishResponse>> GetAllAsync()
    {
        // Role zarządzające otrzymują pełną listę dań w tym również pozycje nieaktywne
        return await _context.Dishes
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new DishResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<ActiveDishResponse?> GetActiveByIdAsync(Guid id)
    {
        // Przy pobieraniu szczegółów dla użytkownika końcowego ponownie sprawdzany jest status aktywności dania
        return await _context.Dishes
            .AsNoTracking()
            .Where(x => x.Id == id && x.IsActive)
            .Select(x => new ActiveDishResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<DishResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Dishes
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new DishResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<DishResponse> CreateAsync(CreateDishRequest request)
    {
        ValidateDishName(request.Name);

        // Nowo utworzone danie jest domyślnie aktywne, dzięki czemu może zostać wykorzystane przy tworzeniu menu
        var dish = new Dish
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true
        };

        _context.Dishes.Add(dish);
        await _context.SaveChangesAsync();

        return MapToResponse(dish);
    }

    public async Task<DishResponse?> UpdateAsync(Guid id, UpdateDishRequest request)
    {
        ValidateDishName(request.Name);

        var dish = await _context.Dishes
            .FirstOrDefaultAsync(x => x.Id == id);

        if (dish is null)
            return null;

        dish.Name = request.Name.Trim();
        dish.Description = request.Description?.Trim();

        // Status aktywności pozwala ukryć danie przed użytkownikami bez konieczności jego fizycznego usuwania z bazy danych
        dish.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        dish.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponse(dish);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var dish = await _context.Dishes
            .FirstOrDefaultAsync(x => x.Id == id);

        if (dish is null)
            return false;

        _context.Dishes.Remove(dish);
        await _context.SaveChangesAsync();

        return true;
    }

    private static void ValidateDishName(string? name)
    {
        // Walidacja po stronie API zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");
    }

    //
    private static DishResponse MapToResponse(Dish dish)
    {
        return new DishResponse
        {
            Id = dish.Id,
            Name = dish.Name,
            Description = dish.Description,
            IsActive = dish.IsActive,
            CreatedAt = dish.CreatedAt,
            UpdatedAt = dish.UpdatedAt
        };
    }
}