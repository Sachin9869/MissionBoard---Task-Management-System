using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MissionBoard.Api.Data;
using MissionBoard.Api.Models;

namespace MissionBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetTasks()
    {
        var tasks = await _context.Tasks
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
                .ThenInclude(c => c.Author)
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                id = t.Id,
                title = t.Title,
                description = t.Description,
                status = t.Status,
                priority = t.Priority,
                createdById = t.CreatedById,
                createdByName = t.CreatedBy.UserName,
                assigneeId = t.AssigneeId,
                assigneeName = t.Assignee != null ? t.Assignee.UserName : null,
                createdAt = t.CreatedAt,
                updatedAt = t.UpdatedAt,
                dueDate = t.DueDate,
                estimatedHours = t.EstimatedHours,
                comments = t.Comments.Where(c => !c.IsDeleted).Select(c => new
                {
                    id = c.Id,
                    authorId = c.AuthorId,
                    authorName = c.Author.UserName,
                    text = c.Text,
                    createdAt = c.CreatedAt
                })
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetTask(string id)
    {
        var task = await _context.Tasks
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
                .ThenInclude(c => c.Author)
            .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

        if (task == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            id = task.Id,
            title = task.Title,
            description = task.Description,
            status = task.Status,
            priority = task.Priority,
            createdById = task.CreatedById,
            createdByName = task.CreatedBy.UserName,
            assigneeId = task.AssigneeId,
            assigneeName = task.Assignee?.UserName,
            createdAt = task.CreatedAt,
            updatedAt = task.UpdatedAt,
            dueDate = task.DueDate,
            estimatedHours = task.EstimatedHours,
            comments = task.Comments.Where(c => !c.IsDeleted).Select(c => new
            {
                id = c.Id,
                authorId = c.AuthorId,
                authorName = c.Author.UserName,
                text = c.Text,
                createdAt = c.CreatedAt
            })
        });
    }

    [HttpPost]
    public async Task<ActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var task = new TaskItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            CreatedById = userId,
            AssigneeId = request.AssigneeId,
            Status = Models.TaskStatus.Backlog,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new { id = task.Id });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTask(string id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null || !task.IsActive)
        {
            return NotFound();
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;
        task.AssigneeId = request.AssigneeId;
        task.Status = request.Status;
        task.DueDate = request.DueDate;
        task.EstimatedHours = (double?)request.EstimatedHours;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { id = task.Id, message = "Task updated successfully" });
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateTaskStatus(string id, [FromBody] UpdateTaskStatusRequest request)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null || !task.IsActive)
        {
            return NotFound();
        }

        task.Status = request.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { id = task.Id, status = task.Status });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(string id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null || !task.IsActive)
        {
            return NotFound();
        }

        // Soft delete
        task.IsActive = false;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { id = task.Id, message = "Task deleted successfully" });
    }
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public string? AssigneeId { get; set; }
}

public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public string? AssigneeId { get; set; }
    public Models.TaskStatus Status { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal? EstimatedHours { get; set; }
}

public class UpdateTaskStatusRequest
{
    public Models.TaskStatus Status { get; set; }
}