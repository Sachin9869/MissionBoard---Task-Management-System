using Microsoft.EntityFrameworkCore;
using MissionBoard.Core.Models;
using System.Text.Json;

namespace MissionBoard.Core.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Right> Rights { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<RoleRight> RoleRights { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UserRole composite key
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);

        // RoleRight composite key
        modelBuilder.Entity<RoleRight>()
            .HasKey(rr => new { rr.RoleId, rr.RightId });

        modelBuilder.Entity<RoleRight>()
            .HasOne(rr => rr.Role)
            .WithMany(r => r.RoleRights)
            .HasForeignKey(rr => rr.RoleId);

        modelBuilder.Entity<RoleRight>()
            .HasOne(rr => rr.Right)
            .WithMany(r => r.RoleRights)
            .HasForeignKey(rr => rr.RightId);

        // User relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(u => u.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // Team relationships
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Manager)
            .WithMany(u => u.ManagedTeams)
            .HasForeignKey(t => t.ManagerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // TaskItem relationships
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.CreatedBy)
            .WithMany(u => u.CreatedTasks)
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Team)
            .WithMany(team => team.Tasks)
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // Comment relationships
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Task)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.Status);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.AssigneeId);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.TeamId);
    }

    public async Task SeedDataAsync(string seedDataPath)
    {
        if (await Users.AnyAsync()) return; // Already seeded

        try
        {
            var jsonData = await File.ReadAllTextAsync(seedDataPath);
            var seedData = JsonSerializer.Deserialize<SeedData>(jsonData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (seedData == null) return;

            // Seed in order of dependencies
            if (seedData.Roles?.Any() == true)
            {
                await Roles.AddRangeAsync(seedData.Roles);
                await SaveChangesAsync();
            }

            if (seedData.Rights?.Any() == true)
            {
                await Rights.AddRangeAsync(seedData.Rights);
                await SaveChangesAsync();
            }

            if (seedData.Users?.Any() == true)
            {
                await Users.AddRangeAsync(seedData.Users);
                await SaveChangesAsync();
            }

            if (seedData.Teams?.Any() == true)
            {
                await Teams.AddRangeAsync(seedData.Teams);
                await SaveChangesAsync();
            }

            if (seedData.UserRoles?.Any() == true)
            {
                await UserRoles.AddRangeAsync(seedData.UserRoles);
                await SaveChangesAsync();
            }

            if (seedData.RoleRights?.Any() == true)
            {
                await RoleRights.AddRangeAsync(seedData.RoleRights);
                await SaveChangesAsync();
            }

            if (seedData.Tasks?.Any() == true)
            {
                foreach (var task in seedData.Tasks)
                {
                    await Tasks.AddAsync(task);

                    if (task.Comments?.Any() == true)
                    {
                        foreach (var comment in task.Comments)
                        {
                            comment.TaskId = task.Id;
                            await Comments.AddAsync(comment);
                        }
                    }
                }
                await SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            // Log error in production
            throw new InvalidOperationException($"Failed to seed database: {ex.Message}", ex);
        }
    }
}

public class SeedData
{
    public List<Role>? Roles { get; set; }
    public List<Right>? Rights { get; set; }
    public List<User>? Users { get; set; }
    public List<Team>? Teams { get; set; }
    public List<UserRole>? UserRoles { get; set; }
    public List<RoleRight>? RoleRights { get; set; }
    public List<TaskItem>? Tasks { get; set; }
}