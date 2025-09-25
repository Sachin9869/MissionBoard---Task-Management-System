using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; }

    [Required]
    [MaxLength(256)]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }

    public int RoleId { get; set; }
    public Role Role { get; set; }

    public int? OrganizationId { get; set; }
    public Organization Organization { get; set; }

    public int? TeamId { get; set; }
    public Team Team { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    // Legacy Rights support for backward compatibility
    public ICollection<Rights> Rights { get; set; } = new List<Rights>();
}
