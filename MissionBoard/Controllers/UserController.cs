using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRbacService _rbacService;

    public UserController(AppDbContext context, IRbacService rbacService)
    {
        _context = context;
        _rbacService = rbacService;
    }

    /// <summary>
    /// Get all users (Admin/Owner only)
    /// </summary>
    /// <returns>List of users</returns>
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.HasPermissionAsync(User, "users.manage"))
            return Forbid();

        var users = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Organization)
            .Include(u => u.Team)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                Role = u.Role.Name,
                Organization = u.Organization != null ? new { u.Organization.Id, u.Organization.Name } : null,
                Team = u.Team != null ? new { u.Team.Id, u.Team.Name } : null
            })
            .ToListAsync();

        await _rbacService.LogActionAsync(userId, "VIEW_USERS", "User", null, $"Retrieved {users.Count} users", HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(users);
    }

    /// <summary>
    /// Get a specific user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int currentUserId))
            return Unauthorized();

        // Users can view their own profile, or admin can view any profile
        if (currentUserId != id && !await _rbacService.HasPermissionAsync(User, "users.manage"))
            return Forbid();

        var user = await _context.Users
            .Include(u => u.Role)
            .ThenInclude(r => r.Permissions)
            .Include(u => u.Organization)
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        var response = new
        {
            user.Id,
            user.UserName,
            user.Email,
            Role = new { user.Role.Id, user.Role.Name, user.Role.Description, user.Role.Level },
            Permissions = user.Role.Permissions.Select(p => new { p.Id, p.Name, p.Description }),
            Organization = user.Organization != null ? new { user.Organization.Id, user.Organization.Name } : null,
            Team = user.Team != null ? new { user.Team.Id, user.Team.Name } : null
        };

        await _rbacService.LogActionAsync(currentUserId, "VIEW_USER", "User", id, null, HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(response);
    }

    /// <summary>
    /// Get users in the current user's team
    /// </summary>
    /// <returns>Team members</returns>
    [HttpGet("team-members")]
    public async Task<IActionResult> GetTeamMembers()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        var currentUser = await _context.Users
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (currentUser?.TeamId == null)
            return Ok(new List<object>());

        var teamMembers = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.TeamId == currentUser.TeamId)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                Role = u.Role.Name
            })
            .ToListAsync();

        return Ok(teamMembers);
    }
}