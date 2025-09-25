using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Core.Models;

public class UserRole
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int RoleId { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}