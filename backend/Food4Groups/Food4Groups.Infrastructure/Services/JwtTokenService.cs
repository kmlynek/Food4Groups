using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Food4Groups.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Food4Groups.Infrastructure.Services;

// Serwis odpowiedzialny za generowanie tokenów JWT wykorzystywanych do uwierzytelniania i autoryzacji użytkowników
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<IdentityUser> _userManager;
 
    public JwtTokenService(IConfiguration configuration, UserManager<IdentityUser> userManager)
    {
        _configuration = configuration;
        _userManager = userManager;
    }
    
    public async Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(IdentityUser user)
    {
        // Pobranie parametrów wymaganych do utworzenia i podpisania tokenu JWT
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Key");
        var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Issuer");
        var audience = _configuration["Jwt:Audience"]  ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Audience");

        // Zestaw podstawowych informacji o użytkowniku umieszczanych w tokenie
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty) // Jeśli user.UserName jest null to używa pustego stringa ""
        };

        // Dodanie ról użytkownika umożliwia wykorzystanie atrybutu [Authorize(Roles = "...")]
        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        // Utworzenie klucza i danych wykorzystywanych do podpisania tokenu - klucz kryptograficzny
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        // Określenie czasu ważności tokenu
        var expires = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        // Serializacja tokenu do postaci tekstowej zwracanej klientowi
        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
        return (tokenValue, expires);
    }
}