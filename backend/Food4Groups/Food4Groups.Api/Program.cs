using System.Text;
using Food4Groups.Api.Extensions;
using Food4Groups.Application.Interfaces;
using Food4Groups.Infrastructure.Persistence;
using Food4Groups.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


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

var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

//Rejestracja mechanizmu autentykacji
//konfiguracja w celu użycia JWT do autentykacji i określenie walidacji tokena
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)) //sprawdza klucz, którym jest podpisywany token
        };
    });
//włącza autoryzację
builder.Services.AddAuthorization();



//Wszystko powyżej to konfiguracja startowa, teraz start aplikacji
var app = builder.Build();

await app.Services.SeedIdentityAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication(); //1. Sorawdza czy jest token i czy jest poprawny
app.UseAuthorization(); //2. Sprawdza [Authorize] role
app.MapControllers(); //3. Działanie controllera 

app.Run();