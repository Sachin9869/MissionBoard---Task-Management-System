using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

public class RbacService : IRbacService
{
    private readonly AppDbContext _context;

    public RbacService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasPermissionAsync(int userId, string permission)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .ThenInclude(r => r.Permissions)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.Role?.Permissions?.Any(p => p.Name == permission) ?? false;
    }

    public async Task<bool> HasPermissionAsync(ClaimsPrincipal user, string permission)
    {
        if (user == null) return false;

        // Check direct permission claim
        if (user.HasClaim("permission", permission))
            return true;

        // Check role-based inheritance
        var roleName = user.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(roleName)) return false;

        // Owner role has all permissions
        if (roleName == "Owner") return true;

        // Admin role has most permissions except system management
        if (roleName == "Admin" && !permission.StartsWith("system.")) return true;

        return false;
    }

    public async Task<bool> CanAccessTaskAsync(int userId, int taskId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        var task = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return false;

        // Owner and Admin can access all tasks
        if (user.Role.Name == "Owner" || user.Role.Name == "Admin") return true;

        // Users can access tasks in their organization/team
        if (user.OrganizationId.HasValue && task.Team?.OrganizationId == user.OrganizationId) return true;

        // Users can access tasks assigned to them
        if (task.AssignedToId == userId) return true;

        // Users can access tasks they created
        if (task.CreatedById == userId) return true;

        return false;
    }

    public async Task<bool> CanAccessTaskAsync(ClaimsPrincipal user, int taskId)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId)) return false;

        return await CanAccessTaskAsync(userId, taskId);
    }

    public async Task<bool> CanAccessTeamAsync(int userId, int teamId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        // Owner and Admin can access all teams
        if (user.Role.Name == "Owner" || user.Role.Name == "Admin") return true;

        var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == teamId);
        if (team == null) return false;

        // Users can access teams in their organization
        if (user.OrganizationId == team.OrganizationId) return true;

        return false;
    }

    public async Task<bool> CanAccessOrganizationAsync(int userId, int organizationId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        // Owner can access all organizations
        if (user.Role.Name == "Owner") return true;

        // Users can only access their own organization
        return user.OrganizationId == organizationId;
    }

    public bool HasRoleLevel(ClaimsPrincipal user, int maxLevel)
    {
        var roleLevelClaim = user.FindFirst("role_level")?.Value;
        if (!int.TryParse(roleLevelClaim, out int roleLevel)) return false;

        return roleLevel <= maxLevel;
    }

    public async Task LogActionAsync(int userId, string action, string entityType, int? entityId, string details = null, string ipAddress = null)
    {
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}