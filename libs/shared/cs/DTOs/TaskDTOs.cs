using MissionBoard.Core.Models;
using System.ComponentModel.DataAnnotations;

namespace MissionBoard.Core.DTOs;

public class TaskDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public string CreatedById { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? TeamId { get; set; }
    public string? TeamName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public double? EstimatedHours { get; set; }
    public List<CommentDto> Comments { get; set; } = new();
}

public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public string? AssigneeId { get; set; }

    public string? TeamId { get; set; }

    public DateTime? DueDate { get; set; }

    public double? EstimatedHours { get; set; }
}

public class UpdateTaskRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public TaskPriority? Priority { get; set; }

    public string? AssigneeId { get; set; }

    public string? TeamId { get; set; }

    public DateTime? DueDate { get; set; }

    public double? EstimatedHours { get; set; }
}

public class UpdateTaskStatusRequest
{
    [Required]
    public TaskStatus Status { get; set; }
}

public class AssignTaskRequest
{
    [Required]
    public string AssigneeId { get; set; } = string.Empty;
}

public class CommentDto
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateCommentRequest
{
    [Required]
    public string Text { get; set; } = string.Empty;
}