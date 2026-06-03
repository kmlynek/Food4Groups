using Food4Groups.Application.DTOs.Auth;
using Food4Groups.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

//Dodawanie endpointow, autentykacja, autoryzacja
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(UserManager<IdentityUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Weryfikacja czy konto o podanym adresie email nie istnieje już w systemie
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            return BadRequest("User with this email already exists");
        }
        // Utworzenie nowego użytkownika w oparciu o Identity.
        var user = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true // Nie jest wykorzystywany mechanizm potwierdzenia email stąd - true
        };
        
        var result = await _userManager.CreateAsync(user, request.Password);
        
        if (!result.Succeeded)
            return BadRequest(result.Errors);
                
        // Domyślna rola User dla każdego nowego użytkownika
        await _userManager.AddToRoleAsync(user, "User");
        
        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)

    {
        // Wyszukanie użytkownika na podstawie email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized("User not found");
        }
        // Weryfikacja poprawności hasła przy użyciu Identity 
        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            return Unauthorized("Invalid password");
        }
        // Po pomyślnej autentykacji generowany jest token JWT
        var (token, expiresAt) = await _jwtTokenService.GenerateTokenAsync(user);

        return Ok(new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt
        });
    }
}
    
    
    



