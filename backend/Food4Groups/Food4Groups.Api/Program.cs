using Food4Groups.Api.Extensions;
using Food4Groups.Application.Interfaces;
using Food4Groups.Infrastructure.Persistence;
using Food4Groups.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


//Pobiera connection string z pliku konfiguracyjnego .json i dodaje DbContext do aplikacji
//konfiguruje połączenie z bazą
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string" + "'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

//Konfiguracja Identity
builder.Services
    .AddIdentityCore<IdentityUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();


builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//Rejestracja serwisu JWT w DI(gdy potrzeba IJwtTokenService, użyj JwtTokenService 
// lifetime Scoped: 1 instancja na request HTTP)
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

//Wszystko powyżej to konfiguracja startowa, teraz start aplikacji
var app = builder.Build();

await app.Services.SeedIdentityAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();