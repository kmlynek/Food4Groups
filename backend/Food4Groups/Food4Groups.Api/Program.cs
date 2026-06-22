using System.Text;
using Food4Groups.Api.Extensions;
using Food4Groups.Application.Interfaces;
using Food4Groups.Application.Interfaces.Addons;
using Food4Groups.Application.Interfaces.Admin;
using Food4Groups.Application.Interfaces.Auth;
using Food4Groups.Application.Interfaces.CateringCompanies;
using Food4Groups.Application.Interfaces.Dishes;
using Food4Groups.Application.Interfaces.GroupMembers;
using Food4Groups.Application.Interfaces.GroupPackageAssignments;
using Food4Groups.Application.Interfaces.Groups;
using Food4Groups.Application.Interfaces.MenuDayAddons;
using Food4Groups.Application.Interfaces.MenuDays;
using Food4Groups.Application.Interfaces.MenuItems;
using Food4Groups.Application.Interfaces.MenuPeriods;
using Food4Groups.Application.Interfaces.Orders;
using Food4Groups.Application.Interfaces.PackageAddons;
using Food4Groups.Application.Interfaces.PackageDishes;
using Food4Groups.Application.Interfaces.Packages;
using Food4Groups.Infrastructure.Persistence;
using Food4Groups.Infrastructure.Services;
using Food4Groups.Infrastructure.Services.Addons;
using Food4Groups.Infrastructure.Services.Admin;
using Food4Groups.Infrastructure.Services.Auth;
using Food4Groups.Infrastructure.Services.CateringCompanies;
using Food4Groups.Infrastructure.Services.Dishes;
using Food4Groups.Infrastructure.Services.GroupMembers;
using Food4Groups.Infrastructure.Services.GroupPackageAssignments;
using Food4Groups.Infrastructure.Services.Groups;
using Food4Groups.Infrastructure.Services.MenuDayAddons;
using Food4Groups.Infrastructure.Services.MenuDays;
using Food4Groups.Infrastructure.Services.MenuItems;
using Food4Groups.Infrastructure.Services.MenuPeriods;
using Food4Groups.Infrastructure.Services.Orders;
using Food4Groups.Infrastructure.Services.PackageAddons;
using Food4Groups.Infrastructure.Services.PackageDishes;
using Food4Groups.Infrastructure.Services.Packages;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;


var builder = WebApplication.CreateBuilder(args);


// Konfiguracja połączenia z bazą danych PostgreSQL / Pobiera connection string z pliku konfiguracyjnego .json i dodaje DbContext do aplikacji
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string" + "'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

//Konfiguracja Identity z obsługą ról i zapisem danych w EF Core
builder.Services
    .AddIdentityCore<IdentityUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();


builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Konfiguracja Swaggera
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

// Rejestracja serwisu odpowiedzialnego za generowanie tokenów JWT oraz pozostaluch Servisow z logika biznesowa
// lifetime Scoped: 1 instancja na request HTTP
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

builder.Services.AddScoped<IDishService, DishService>();
builder.Services.AddScoped<IAddonService, AddonService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IGroupMemberService, GroupMemberService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICateringCompanyService, CateringCompanyService>();
builder.Services.AddScoped<IGroupPackageAssignmentService, GroupPackageAssignmentService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<IPackageDishService, PackageDishService>();
builder.Services.AddScoped<IPackageAddonService, PackageAddonService>();
builder.Services.AddScoped<IMenuDayService, MenuDayService>();
builder.Services.AddScoped<IMenuPeriodService, MenuPeriodService>();
builder.Services.AddScoped<IMenuItemService, MenuItemService>();
builder.Services.AddScoped<IMenuDayAddonService, MenuDayAddonService>();
builder.Services.AddScoped<IOrderService, OrderService>();


var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

// Konfiguracja mechanizmu uwierzytelniania z wykorzystaniem tokenów JWT
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; //jak sprawdzic kim jest user
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme; //co zrobic, gdy user nie jest zalogowany
    })
    //konfiguracja tokenu dostepu, co musi spełniać 
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            // Klucz używany do weryfikacji podpisu tokenu JWT
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
//Aktywuje autoryzację
builder.Services.AddAuthorization();

// Powyżej konfiguracja startowa, teraz tworzy builder (obiekt) aplikacji
var app = builder.Build();

// Inicjalizacja podstawowych ról i kont testowych przy starcie aplikacji
await app.Services.SeedIdentityAsync();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Middleware
app.UseAuthentication(); //1. Identyfikacja użytkownika na podstawie tokenu
app.UseAuthorization(); //2. Sprawdzenie uprawnień
app.MapControllers(); //3. Działanie kontrolerów 

app.Run();