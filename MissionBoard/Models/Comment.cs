using System.ComponentModel.DataAnnotations;
using System;

public class Comment
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; }

    public int TaskItemId { get; set; }
    public TaskItem TaskItem { get; set; }
}
