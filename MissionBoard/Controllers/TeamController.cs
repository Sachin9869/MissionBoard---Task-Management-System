using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRbacService _rbacService;

    public TeamController(AppDbContext context, IRbacService rbacService)
    {
        _context = context;
        _rbacService = rbacService;
    }

    /// <summary>
    /// Get teams accessible to the current user
    /// </summary>
    /// <returns>List of teams</returns>
    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        var query = _context.Teams
            .Include(t => t.Organization)
            .Include(t => t.Members)
            .AsQueryable();

        // Apply role-based filtering
        var roleName = User.FindFirst(ClaimTypes.Role)?.Value;
        var userOrgId = User.FindFirst("organization")?.Value;

        if (roleName != "Owner" && roleName != "Admin")
        {
            // Non-admin users can only see teams in their organization
            if (int.TryParse(userOrgId, out int orgId))
            {
                query = query.Where(t => t.OrganizationId == orgId);
            }
            else
            {
                // If user has no organization, return empty list
                return Ok(new List<object>());
            }
        }

        var teams = await query
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                Organization = new { t.Organization.Id, t.Organization.Name },
                MemberCount = t.Members.Count
            })
            .ToListAsync();

        await _rbacService.LogActionAsync(userId, "VIEW_TEAMS", "Team", null, $"Retrieved {teams.Count} teams", HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(teams);
    }

    /// <summary>
    /// Get a specific team by ID
    /// </summary>
    /// <param name="id">Team ID</param>
    /// <returns>Team details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeam(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        if (!await _rbacService.CanAccessTeamAsync(userId, id))
            return Forbid();

        var team = await _context.Teams
            .Include(t => t.Organization)
            .Include(t => t.Members)
            .ThenInclude(m => m.Role)
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
            return NotFound();

        var response = new
        {
            team.Id,
            team.Name,
            team.Description,
            Organization = new { team.Organization.Id, team.Organization.Name },
            Members = team.Members.Select(m => new
            {
                m.Id,
                m.UserName,
                m.Email,
                Role = m.Role.Name
            }),
            TaskCount = team.Tasks.Count
        };

        await _rbacService.LogActionAsync(userId, "VIEW_TEAM", "Team", id, null, HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(response);
    }
}