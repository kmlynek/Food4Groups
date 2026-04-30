using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("user")]
    [Authorize(Roles = "User")]
    public IActionResult UserOnly() => Ok("Authorization default User role - successful");
    
    [HttpGet("dietician")]
    [Authorize(Roles = "Dietician")]
    public IActionResult DieticianOnly() => Ok("Authorization Successful");

}