using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

public class Permission
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [MaxLength(200)]
    public string Description { get; set; }

    public ICollection<Role> Roles { get; set; } = new List<Role>();
}