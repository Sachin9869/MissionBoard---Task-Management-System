using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TaskItem> TaskItems { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    // Legacy support
    public DbSet<Rights> Rights { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Role-Permission many-to-many
        modelBuilder.Entity<Role>()
            .HasMany(r => r.Permissions)
            .WithMany(p => p.Roles)
            .UsingEntity(j => j.ToTable("RolePermissions"));

        // User-Role one-to-many
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Organization-User one-to-many
        modelBuilder.Entity<User>()
            .HasOne(u => u.Organization)
            .WithMany(o => o.Users)
            .HasForeignKey(u => u.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Organization-Team one-to-many
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Organization)
            .WithMany(o => o.Teams)
            .HasForeignKey(t => t.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        // User-Team one-to-many (Team has many Users)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(u => u.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // Team-TaskItem one-to-many
        modelBuilder.Entity<TaskItem>()
            .HasOne(ti => ti.Team)
            .WithMany(t => t.Tasks)
            .HasForeignKey(ti => ti.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // User-TaskItem one-to-many (AssignedTo)
        modelBuilder.Entity<TaskItem>()
            .HasOne(ti => ti.AssignedTo)
            .WithMany(u => u.Tasks)
            .HasForeignKey(ti => ti.AssignedToId)
            .OnDelete(DeleteBehavior.SetNull);

        // User-TaskItem one-to-many (CreatedBy)
        modelBuilder.Entity<TaskItem>()
            .HasOne(ti => ti.CreatedBy)
            .WithMany()
            .HasForeignKey(ti => ti.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // TaskItem-Comment one-to-many
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.TaskItem)
            .WithMany(ti => ti.Comments)
            .HasForeignKey(c => c.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // User-Comment one-to-many
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // User-AuditLog one-to-many
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Legacy User-Rights many-to-many with explicit join table
        modelBuilder.Entity<User>()
            .HasMany(u => u.Rights)
            .WithMany(r => r.Users)
            .UsingEntity(j => j.ToTable("UserRights"));

        // Ensure Rights table name is unique
        modelBuilder.Entity<Rights>().ToTable("Rights");
    }
}
