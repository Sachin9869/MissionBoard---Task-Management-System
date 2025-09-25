using System.Security.Claims;

public interface IRbacService
{
    Task<bool> HasPermissionAsync(int userId, string permission);
    Task<bool> HasPermissionAsync(ClaimsPrincipal user, string permission);
    Task<bool> CanAccessTaskAsync(int userId, int taskId);
    Task<bool> CanAccessTaskAsync(ClaimsPrincipal user, int taskId);
    Task<bool> CanAccessTeamAsync(int userId, int teamId);
    Task<bool> CanAccessOrganizationAsync(int userId, int organizationId);
    bool HasRoleLevel(ClaimsPrincipal user, int maxLevel);
    Task LogActionAsync(int userId, string action, string entityType, int? entityId, string details = null, string ipAddress = null);
}