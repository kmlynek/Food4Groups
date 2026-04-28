namespace Food4Groups.Application.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
}