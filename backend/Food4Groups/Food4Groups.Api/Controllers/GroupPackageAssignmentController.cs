using Food4Groups.Application.DTOs.GroupPackageAssignments;
using Food4Groups.Application.Interfaces.GroupPackageAssignments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee")]
public class GroupPackageAssignmentsController : ControllerBase
{
    private readonly IGroupPackageAssignmentService _groupPackageAssignmentService;

    public GroupPackageAssignmentsController(IGroupPackageAssignmentService groupPackageAssignmentService)
    {
        _groupPackageAssignmentService = groupPackageAssignmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var assignments = await _groupPackageAssignmentService.GetAllAsync();

        return Ok(assignments);
    }

    [HttpGet("group/{groupId:guid}")]
    public async Task<IActionResult> GetByGroupId(Guid groupId)
    {
        var assignments = await _groupPackageAssignmentService.GetByGroupIdAsync(groupId);

        return Ok(assignments);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var assignment = await _groupPackageAssignmentService.GetByIdAsync(id);

        return assignment is null ? NotFound() : Ok(assignment);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGroupPackageAssignmentRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var assignment = await _groupPackageAssignmentService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = assignment.Id }, assignment);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupPackageAssignmentRequest request)
    {
        try
        {
            var assignment = await _groupPackageAssignmentService.UpdateAsync(id, request);

            return assignment is null ? NotFound() : Ok(assignment);
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
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _groupPackageAssignmentService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}