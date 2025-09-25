using System.Security.Claims;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    ClaimsPrincipal ValidateToken(string token);
}