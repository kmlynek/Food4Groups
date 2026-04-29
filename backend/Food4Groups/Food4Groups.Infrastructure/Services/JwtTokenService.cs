using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Food4Groups.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Food4Groups.Infrastructure.Services;

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
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Key");
        var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Issuer");
        var audience = _configuration["Jwt:Audience"]  ?? throw new InvalidOperationException("Missing configuration setting: Jwt:Audience");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty)
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
        return (tokenValue, expires);
    }
}