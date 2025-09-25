using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Core.Models;

public class RoleRight
{
    [Required]
    public int RoleId { get; set; }

    [Required]
    public int RightId { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Right Right { get; set; } = null!;
}