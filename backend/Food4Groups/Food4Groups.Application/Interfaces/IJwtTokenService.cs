using Microsoft.AspNetCore.Identity;

namespace Food4Groups.Application.Interfaces;

public interface IJwtTokenService
{
    Task<(string Token, DateTime ExpiresAt)> GenerateTokenAsync(IdentityUser user);
}