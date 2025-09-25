using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/audit-log")]
[Authorize]
public class AuditLogController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRbacService _rbacService;

    public AuditLogController(AppDbContext context, IRbacService rbacService)
    {
        _context = context;
        _rbacService = rbacService;
    }

    /// <summary>
    /// Get audit log entries with filtering
    /// </summary>
    /// <param name="entityType">Filter by entity type</param>
    /// <param name="entityId">Filter by entity ID</param>
    /// <param name="action">Filter by action</param>
    /// <param name="userId">Filter by user ID</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Page size (max 100)</param>
    /// <returns>Paginated audit log entries</returns>
    [HttpGet]
    public async Task<IActionResult> GetAuditLog(
        [FromQuery] string entityType = null,
        [FromQuery] int? entityId = null,
        [FromQuery] string action = null,
        [FromQuery] int? userId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(currentUserIdClaim, out int currentUserId))
            return Unauthorized();

        // Only admin and owner roles can view audit logs
        var roleName = User.FindFirst(ClaimTypes.Role)?.Value;
        if (roleName != "Owner" && roleName != "Admin")
            return Forbid();

        pageSize = Math.Min(pageSize, 100); // Limit page size
        var skip = (page - 1) * pageSize;

        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (entityId.HasValue)
            query = query.Where(a => a.EntityId == entityId.Value);

        if (!string.IsNullOrEmpty(action))
            query = query.Where(a => a.Action.Contains(action));

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        var totalCount = await query.CountAsync();
        var entries = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.EntityType,
                a.EntityId,
                a.Details,
                a.CreatedAt,
                a.IpAddress,
                User = new { a.User.Id, a.User.UserName }
            })
            .ToListAsync();

        // Log this audit log access
        await _rbacService.LogActionAsync(currentUserId, "VIEW_AUDIT_LOG", "AuditLog", null, $"Viewed audit log (page {page})", HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new
        {
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            Entries = entries
        });
    }
}