using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;

public enum TaskStatus
{
    Backlog,
    InProgress,
    Review,
    Done
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}

public class TaskItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.Backlog;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }

    public int CreatedById { get; set; }
    public User CreatedBy { get; set; }

    public int? AssignedToId { get; set; }
    public User AssignedTo { get; set; }

    public int? TeamId { get; set; }
    public Team Team { get; set; }

    // Legacy support
    public bool IsCompleted { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
