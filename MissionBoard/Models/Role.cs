using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

public class Role
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; }

    [MaxLength(200)]
    public string Description { get; set; }

    public int Level { get; set; } // For role inheritance: Owner=1, Admin=2, Manager=3, Developer=4, QA=5, Business=6, Viewer=7

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}