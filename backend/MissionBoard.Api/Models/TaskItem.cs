using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Api.Models;

public class TaskItem
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public TaskStatus Status { get; set; } = TaskStatus.Backlog;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    [Required]
    public string CreatedById { get; set; } = string.Empty;

    public string? AssigneeId { get; set; }

    public string? TeamId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DueDate { get; set; }

    public double? EstimatedHours { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User CreatedBy { get; set; } = null!;
    public User? Assignee { get; set; }
    public Team? Team { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

public enum TaskStatus
{
    Backlog = 0,
    InProgress = 1,
    WithQA = 2,
    UAT = 3,
    ReadyForProd = 4,
    Done = 5
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}