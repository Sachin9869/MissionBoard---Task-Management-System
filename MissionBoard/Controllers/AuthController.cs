using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IRbacService _rbacService;

    public AuthController(
        AppDbContext context,
        IJwtTokenService jwtService,
        IPasswordHasher passwordHasher,
        IRbacService rbacService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _rbacService = rbacService;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>JWT token and user information</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users
            .Include(u => u.Role)
            .ThenInclude(r => r.Permissions)
            .Include(u => u.Organization)
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.UserName == request.Username);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            // Log failed login attempt
            if (user != null)
            {
                await _rbacService.LogActionAsync(
                    user.Id,
                    "LOGIN_FAILED",
                    "User",
                    user.Id,
                    "Invalid password",
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }

            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = _jwtService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddMinutes(60); // Should match JWT config

        // Log successful login
        await _rbacService.LogActionAsync(
            user.Id,
            "LOGIN_SUCCESS",
            "User",
            user.Id,
            "Successful login",
            HttpContext.Connection.RemoteIpAddress?.ToString());

        var response = new LoginResponse
        {
            Token = token,
            Username = user.UserName,
            Role = user.Role.Name,
            Permissions = user.Role.Permissions.Select(p => p.Name).ToArray(),
            OrganizationId = user.OrganizationId,
            TeamId = user.TeamId,
            ExpiresAt = expiresAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Gets the current authenticated user's information
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.Role)
            .ThenInclude(r => r.Permissions)
            .Include(u => u.Organization)
            .Include(u => u.Team)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        var response = new
        {
            Id = user.Id,
            Username = user.UserName,
            Email = user.Email,
            Role = user.Role.Name,
            Permissions = user.Role.Permissions.Select(p => p.Name).ToArray(),
            Organization = user.Organization != null ? new { user.Organization.Id, user.Organization.Name } : null,
            Team = user.Team != null ? new { user.Team.Id, user.Team.Name } : null
        };

        return Ok(response);
    }
}