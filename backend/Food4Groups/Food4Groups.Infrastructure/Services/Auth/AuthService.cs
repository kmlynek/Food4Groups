using Food4Groups.Application.DTOs.Auth;
using Food4Groups.Application.Interfaces;
using Food4Groups.Application.Interfaces.Auth;
using Microsoft.AspNetCore.Identity;

namespace Food4Groups.Infrastructure.Services.Auth;

public class AuthService : IAuthService
{
  private readonly UserManager<IdentityUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserManager<IdentityUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task RegisterAsync(RegisterRequest request)
    {
        ValidateRegisterRequest(request);

        // Weryfikacja czy konto o podanym adresie email nie istnieje już w systemie
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            throw new ArgumentException("User with this email already exists");

        // Utworzenie nowego użytkownika w oparciu o Identity
        var user = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true // Nie jest wykorzystywany mechanizm potwierdzenia email stąd - true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(result));

        // Domyślna rola User dla każdego nowego użytkownika
        var roleResult = await _userManager.AddToRoleAsync(user, "User");
        if (!roleResult.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(roleResult));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        ValidateLoginRequest(request);

        // Wyszukanie użytkownika na podstawie email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            throw new UnauthorizedAccessException("User not found");

        // Weryfikacja poprawności hasła przy użyciu Identity
        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            throw new UnauthorizedAccessException("Invalid password");

        // Po pomyślnej autentykacji generowany jest token JWT
        var (token, expiresAt) = await _jwtTokenService.GenerateTokenAsync(user);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt
        };
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        ValidateChangePasswordRequest(request);

        // Zmiana hasła jest wykonywana dla aktualnie zalogowanego użytkownika
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("User not found");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(result));
    }

    private static void ValidateRegisterRequest(RegisterRequest request)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Password is required");
    }

    private static void ValidateLoginRequest(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Password is required");
    }

    private static void ValidateChangePasswordRequest(ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            throw new ArgumentException("Current password is required");

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            throw new ArgumentException("New password is required");
    }

    private static string FormatIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(x => x.Description));
    }
}