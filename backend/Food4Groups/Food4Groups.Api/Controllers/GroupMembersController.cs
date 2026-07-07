using Food4Groups.Application.DTOs.GroupMembers;
using Food4Groups.Application.Interfaces.GroupMembers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupMembersController : ControllerBase
{
    private readonly IGroupMemberService _groupMemberService;

    public GroupMembersController(IGroupMemberService groupMemberService)
    {
        _groupMemberService = groupMemberService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetAll()
    {
        var members = await _groupMemberService.GetAllAsync();
        return Ok(members);
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<ActionResult<List<AvailableGroupMemberResponse>>> GetUsers()
    {
        var users = await _groupMemberService.GetAvailableUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var member = await _groupMemberService.GetByIdAsync(id);
        return member is null ? NotFound() : Ok(member);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Create([FromBody] CreateGroupMemberRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var member = await _groupMemberService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupMemberRequest request)
    {
        try
        {
            var member = await _groupMemberService.UpdateAsync(id, request);
            return member is null ? NotFound() : Ok(member);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _groupMemberService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }

    }
}