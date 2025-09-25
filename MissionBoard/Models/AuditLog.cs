using System.ComponentModel.DataAnnotations;
using System;

public class AuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; }

    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; }

    public int? EntityId { get; set; }

    [MaxLength(1000)]
    public string Details { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(45)]
    public string IpAddress { get; set; }
}