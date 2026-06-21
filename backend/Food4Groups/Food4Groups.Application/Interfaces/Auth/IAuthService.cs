using Food4Groups.Application.DTOs.Auth;

namespace Food4Groups.Application.Interfaces.Auth;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
}