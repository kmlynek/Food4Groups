using Food4Groups.Application.DTOs.Groups;
using Food4Groups.Application.Interfaces.Groups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetAll()
    {
        // Lista grup jest dostępna dla administratora oraz pracownika obsługującego grupy
        var groups = await _groupService.GetAllAsync();

        return Ok(groups);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var group = await _groupService.GetByIdAsync(id);

        return group is null ? NotFound() : Ok(group);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        try
        {
            var group = await _groupService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = group.Id }, group);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupRequest request)
    {
        try
        {
            var group = await _groupService.UpdateAsync(id, request);

            return group is null ? NotFound() : Ok(group);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _groupService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}

