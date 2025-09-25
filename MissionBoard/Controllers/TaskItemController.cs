using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TaskItemController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRbacService _rbacService;

    public TaskItemController(AppDbContext context, IRbacService rbacService)
    {
        _context = context;
        _rbacService = rbacService;
    }

    /// <summary>
    /// Get all tasks filtered by user permissions
    /// </summary>
    /// <param name="status">Filter by task status</param>
    /// <param name="teamId">Filter by team ID</param>
    /// <param name="assignedToMe">Filter tasks assigned to current user</param>
    /// <returns>List of tasks</returns>
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] TaskStatus? status, [FromQuery] int? teamId, [FromQuery] bool assignedToMe = false)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        var query = _context.TaskItems
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Team)
            .Include(t => t.Comments)
            .AsQueryable();

        // Apply role-based filtering
        var roleName = User.FindFirst(ClaimTypes.Role)?.Value;
        var userOrgId = User.FindFirst("organization")?.Value;
        var userTeamId = User.FindFirst("team")?.Value;

        if (roleName != "Owner" && roleName != "Admin")
        {
            // Non-admin users can only see tasks in their organization
            if (int.TryParse(userOrgId, out int orgId))
            {
                query = query.Where(t => t.Team == null || t.Team.OrganizationId == orgId);
            }
            else
            {
                // If user has no organization, only show tasks assigned to them or created by them
                query = query.Where(t => t.AssignedToId == userId || t.CreatedById == userId);
            }
        }

        // Apply additional filters
        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (teamId.HasValue)
            query = query.Where(t => t.TeamId == teamId.Value);

        if (assignedToMe)
            query = query.Where(t => t.AssignedToId == userId);

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        // Log the action
        await _rbacService.LogActionAsync(userId, "VIEW_TASKS", "TaskItem", null, $"Retrieved {tasks.Count} tasks", HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(tasks.Select(t => new
        {
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.CreatedAt,
            t.DueDate,
            t.CompletedAt,
            CreatedBy = t.CreatedBy != null ? new { t.CreatedBy.Id, t.CreatedBy.UserName } : null,
            AssignedTo = t.AssignedTo != null ? new { t.AssignedTo.Id, t.AssignedTo.UserName } : null,
            Team = t.Team != null ? new { t.Team.Id, t.Team.Name } : null,
            CommentsCount = t.Comments.Count
        }));
    }

    /// <summary>
    /// Get a specific task by ID
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <returns>Task details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.CanAccessTaskAsync(User, id))
            return Forbid();

        var task = await _context.TaskItems
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Team)
            .Include(t => t.Comments)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        await _rbacService.LogActionAsync(userId, "VIEW_TASK", "TaskItem", id, null, HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new
        {
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.CreatedAt,
            task.DueDate,
            task.CompletedAt,
            CreatedBy = new { task.CreatedBy.Id, task.CreatedBy.UserName },
            AssignedTo = task.AssignedTo != null ? new { task.AssignedTo.Id, task.AssignedTo.UserName } : null,
            Team = task.Team != null ? new { task.Team.Id, task.Team.Name } : null,
            Comments = task.Comments.Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                User = new { c.User.Id, c.User.UserName }
            }).OrderBy(c => c.CreatedAt)
        });
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    /// <param name="request">Task creation request</param>
    /// <returns>Created task</returns>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.HasPermissionAsync(User, "tasks.create"))
            return Forbid();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CreatedById = userId,
            AssignedToId = request.AssignedToId,
            TeamId = request.TeamId
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        await _rbacService.LogActionAsync(userId, "CREATE_TASK", "TaskItem", task.Id, $"Created task: {task.Title}", HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new { task.Id, task.Title });
    }

    /// <summary>
    /// Update an existing task
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="request">Task update request</param>
    /// <returns>No content on success</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.CanAccessTaskAsync(User, id))
            return Forbid();

        if (!await _rbacService.HasPermissionAsync(User, "tasks.update"))
            return Forbid();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.TaskItems.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.Status = request.Status ?? task.Status;
        task.Priority = request.Priority ?? task.Priority;
        task.DueDate = request.DueDate ?? task.DueDate;

        if (request.Status == TaskStatus.Done && task.CompletedAt == null)
            task.CompletedAt = DateTime.UtcNow;
        else if (request.Status != TaskStatus.Done)
            task.CompletedAt = null;

        await _context.SaveChangesAsync();

        await _rbacService.LogActionAsync(userId, "UPDATE_TASK", "TaskItem", id, $"Updated task: {task.Title}", HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    /// <summary>
    /// Update task status only
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="request">Status update request</param>
    /// <returns>No content on success</returns>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.CanAccessTaskAsync(User, id))
            return Forbid();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.TaskItems.FindAsync(id);
        if (task == null)
            return NotFound();

        var oldStatus = task.Status;
        task.Status = request.Status;

        if (request.Status == TaskStatus.Done && task.CompletedAt == null)
            task.CompletedAt = DateTime.UtcNow;
        else if (request.Status != TaskStatus.Done)
            task.CompletedAt = null;

        await _context.SaveChangesAsync();

        await _rbacService.LogActionAsync(userId, "UPDATE_TASK_STATUS", "TaskItem", id, $"Changed status from {oldStatus} to {request.Status}", HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    /// <summary>
    /// Assign a task to a user
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="request">Assignment request</param>
    /// <returns>No content on success</returns>
    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.HasPermissionAsync(User, "tasks.assign"))
            return Forbid();

        if (!await _rbacService.CanAccessTaskAsync(User, id))
            return Forbid();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.TaskItems.FindAsync(id);
        if (task == null)
            return NotFound();

        // Verify the assignee exists and can be assigned
        if (request.AssignedToId.HasValue)
        {
            var assignee = await _context.Users.FindAsync(request.AssignedToId.Value);
            if (assignee == null)
                return BadRequest("Assignee not found");
        }

        var oldAssigneeId = task.AssignedToId;
        task.AssignedToId = request.AssignedToId;

        await _context.SaveChangesAsync();

        await _rbacService.LogActionAsync(userId, "ASSIGN_TASK", "TaskItem", id, $"Assigned task to user {request.AssignedToId} (was {oldAssigneeId})", HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    /// <summary>
    /// Delete a task
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.HasPermissionAsync(User, "tasks.delete"))
            return Forbid();

        if (!await _rbacService.CanAccessTaskAsync(User, id))
            return Forbid();

        var task = await _context.TaskItems.FindAsync(id);
        if (task == null)
            return NotFound();

        var taskTitle = task.Title;
        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        await _rbacService.LogActionAsync(userId, "DELETE_TASK", "TaskItem", id, $"Deleted task: {taskTitle}", HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }
}

// DTOs
public class CreateTaskRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Backlog;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }
    public int? AssignedToId { get; set; }
    public int? TeamId { get; set; }
}

public class UpdateTaskRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public TaskStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskStatusRequest
{
    public TaskStatus Status { get; set; }
}

public class AssignTaskRequest
{
    public int? AssignedToId { get; set; }
}