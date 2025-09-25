using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Core.Models;

public class Right
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<RoleRight> RoleRights { get; set; } = new List<RoleRight>();
}