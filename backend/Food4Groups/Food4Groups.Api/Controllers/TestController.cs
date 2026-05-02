using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("user")]
    [Authorize(Roles = "User")]
    public IActionResult UserOnly() => Ok("Authorization User role - successful");
    
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult DietitianOnly() => Ok("Authorization Admin role - Successful");

}