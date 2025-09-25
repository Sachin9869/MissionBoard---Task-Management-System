using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add custom services
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, DevPasswordHasher>();
builder.Services.AddScoped<IRbacService, RbacService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MissionBoard API", Version = "v1" });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // Include XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Add CORS for Angular and frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://localhost:7001",
                "https://localhost:7001")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});

// Use in-memory database for development
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("MissionBoardDb"));

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

// Add Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Owner", policy => policy.RequireClaim(ClaimTypes.Role, "Owner"));
    options.AddPolicy("Admin", policy => policy.RequireClaim(ClaimTypes.Role, "Owner", "Admin"));
    options.AddPolicy("Manager", policy => policy.RequireClaim(ClaimTypes.Role, "Owner", "Admin", "Manager"));
    options.AddPolicy("TaskManagement", policy => policy.RequireClaim("permission", "tasks.create", "tasks.update", "tasks.delete"));
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedDatabase(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MissionBoard API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Serve static files from the frontend build
if (Directory.Exists("wwwroot"))
{
    app.UseDefaultFiles();
    app.UseStaticFiles();

    // Fallback to index.html for SPA routing
    app.MapFallbackToFile("index.html");
}

app.Run();

// Seed database method
async Task SeedDatabase(AppDbContext context)
{
    if (await context.Users.AnyAsync())
        return; // Database already seeded

    // Create organizations
    var org1 = new Organization { Name = "Acme Corporation", Description = "Main organization" };
    var org2 = new Organization { Name = "Tech Startup", Description = "Innovation company" };

    context.Organizations.AddRange(org1, org2);
    await context.SaveChangesAsync();

    // Create roles
    var ownerRole = new Role { Name = "Owner", Description = "System owner with full access", Level = 1 };
    var adminRole = new Role { Name = "Admin", Description = "Administrator with elevated access", Level = 2 };
    var managerRole = new Role { Name = "Manager", Description = "Team manager", Level = 3 };
    var developerRole = new Role { Name = "Developer", Description = "Software developer", Level = 4 };
    var qaRole = new Role { Name = "QA", Description = "Quality assurance tester", Level = 5 };
    var businessRole = new Role { Name = "Business", Description = "Business stakeholder", Level = 6 };
    var viewerRole = new Role { Name = "Viewer", Description = "Read-only access", Level = 7 };

    context.Roles.AddRange(ownerRole, adminRole, managerRole, developerRole, qaRole, businessRole, viewerRole);
    await context.SaveChangesAsync();

    // Create permissions
    var permissions = new[]
    {
        new Permission { Name = "tasks.create", Description = "Create tasks" },
        new Permission { Name = "tasks.update", Description = "Update tasks" },
        new Permission { Name = "tasks.delete", Description = "Delete tasks" },
        new Permission { Name = "tasks.assign", Description = "Assign tasks" },
        new Permission { Name = "users.manage", Description = "Manage users" },
        new Permission { Name = "teams.manage", Description = "Manage teams" },
        new Permission { Name = "system.admin", Description = "System administration" }
    };

    context.Permissions.AddRange(permissions);
    await context.SaveChangesAsync();

    // Assign permissions to roles
    ownerRole.Permissions.Add(permissions[0]); // tasks.create
    ownerRole.Permissions.Add(permissions[1]); // tasks.update
    ownerRole.Permissions.Add(permissions[2]); // tasks.delete
    ownerRole.Permissions.Add(permissions[3]); // tasks.assign
    ownerRole.Permissions.Add(permissions[4]); // users.manage
    ownerRole.Permissions.Add(permissions[5]); // teams.manage
    ownerRole.Permissions.Add(permissions[6]); // system.admin

    adminRole.Permissions.Add(permissions[0]);
    adminRole.Permissions.Add(permissions[1]);
    adminRole.Permissions.Add(permissions[2]);
    adminRole.Permissions.Add(permissions[3]);
    adminRole.Permissions.Add(permissions[4]);
    adminRole.Permissions.Add(permissions[5]);

    managerRole.Permissions.Add(permissions[0]);
    managerRole.Permissions.Add(permissions[1]);
    managerRole.Permissions.Add(permissions[3]);

    developerRole.Permissions.Add(permissions[1]);
    qaRole.Permissions.Add(permissions[1]);
    businessRole.Permissions.Add(permissions[0]);

    await context.SaveChangesAsync();

    // Create teams
    var team1 = new Team { Name = "Alpha Team", Description = "Development team", OrganizationId = org1.Id };
    var team2 = new Team { Name = "Beta Team", Description = "QA team", OrganizationId = org1.Id };

    context.Teams.AddRange(team1, team2);
    await context.SaveChangesAsync();

    var passwordHasher = new DevPasswordHasher();

    // Create users
    var users = new[]
    {
        new User { UserName = "admin", Email = "admin@example.com", PasswordHash = passwordHasher.HashPassword("admin123"), RoleId = ownerRole.Id, OrganizationId = org1.Id },
        new User { UserName = "manager1", Email = "manager1@example.com", PasswordHash = passwordHasher.HashPassword("manager123"), RoleId = managerRole.Id, OrganizationId = org1.Id, TeamId = team1.Id },
        new User { UserName = "manager2", Email = "manager2@example.com", PasswordHash = passwordHasher.HashPassword("manager123"), RoleId = managerRole.Id, OrganizationId = org1.Id, TeamId = team2.Id },
        new User { UserName = "dev1", Email = "dev1@example.com", PasswordHash = passwordHasher.HashPassword("dev123"), RoleId = developerRole.Id, OrganizationId = org1.Id, TeamId = team1.Id },
        new User { UserName = "dev2", Email = "dev2@example.com", PasswordHash = passwordHasher.HashPassword("dev123"), RoleId = developerRole.Id, OrganizationId = org1.Id, TeamId = team2.Id },
        new User { UserName = "qa1", Email = "qa1@example.com", PasswordHash = passwordHasher.HashPassword("qa123"), RoleId = qaRole.Id, OrganizationId = org1.Id, TeamId = team1.Id },
        new User { UserName = "qa2", Email = "qa2@example.com", PasswordHash = passwordHasher.HashPassword("qa123"), RoleId = qaRole.Id, OrganizationId = org1.Id, TeamId = team2.Id },
        new User { UserName = "business1", Email = "business1@example.com", PasswordHash = passwordHasher.HashPassword("business123"), RoleId = businessRole.Id, OrganizationId = org1.Id },
        new User { UserName = "viewer1", Email = "viewer1@example.com", PasswordHash = passwordHasher.HashPassword("viewer123"), RoleId = viewerRole.Id, OrganizationId = org1.Id }
    };

    context.Users.AddRange(users);
    await context.SaveChangesAsync();

    // Create sample tasks
    var tasks = new[]
    {
        new TaskItem { Title = "Setup project structure", Description = "Initialize the project with proper folder structure", Status = TaskStatus.Done, Priority = TaskPriority.High, CreatedById = users[0].Id, AssignedToId = users[3].Id, TeamId = team1.Id, CompletedAt = DateTime.UtcNow.AddDays(-5) },
        new TaskItem { Title = "Implement user authentication", Description = "Add JWT-based authentication system", Status = TaskStatus.InProgress, Priority = TaskPriority.High, CreatedById = users[1].Id, AssignedToId = users[3].Id, TeamId = team1.Id },
        new TaskItem { Title = "Create task management UI", Description = "Build the Kanban board interface", Status = TaskStatus.Backlog, Priority = TaskPriority.Medium, CreatedById = users[1].Id, AssignedToId = users[4].Id, TeamId = team2.Id },
        new TaskItem { Title = "Write unit tests", Description = "Add comprehensive test coverage", Status = TaskStatus.Backlog, Priority = TaskPriority.Low, CreatedById = users[2].Id, AssignedToId = users[5].Id, TeamId = team1.Id },
        new TaskItem { Title = "Setup CI/CD pipeline", Description = "Configure automated deployment", Status = TaskStatus.Review, Priority = TaskPriority.Medium, CreatedById = users[0].Id, AssignedToId = users[3].Id, TeamId = team1.Id }
    };

    context.TaskItems.AddRange(tasks);
    await context.SaveChangesAsync();

    // Add some comments
    var comments = new[]
    {
        new Comment { Content = "Great progress on this task!", UserId = users[1].Id, TaskItemId = tasks[0].Id },
        new Comment { Content = "Working on the JWT implementation now", UserId = users[3].Id, TaskItemId = tasks[1].Id },
        new Comment { Content = "Need UI mockups before starting", UserId = users[4].Id, TaskItemId = tasks[2].Id }
    };

    context.Comments.AddRange(comments);
    await context.SaveChangesAsync();
}
