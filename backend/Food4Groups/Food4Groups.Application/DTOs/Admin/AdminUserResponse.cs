namespace Food4Groups.Application.DTOs.Admin;

public class AdminUserResponse
{
    public required string Id { get; set; }
    public string? Email { get; set; }

    public List<string> Roles { get; set; } = [];
}