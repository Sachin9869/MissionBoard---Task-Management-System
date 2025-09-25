using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Core.DTOs;

public class LoginRequest
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public UserInfo User { get; set; } = null!;
}

public class UserInfo
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? TeamId { get; set; }
    public string? TeamName { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Rights { get; set; } = new();
}