using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MissionBoard.Api.Data;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("MissionBoardDb"));

// Authentication & Authorization
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "ThisIsASecretKeyForDevelopmentOnlyDoNotUseInProduction123456789");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "MissionBoard",
            ValidAudience = jwtSettings["Audience"] ?? "MissionBoard-Client",
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:4201", "https://localhost:4201", "http://localhost:4202", "https://localhost:4202", "http://localhost:4203", "https://localhost:4203")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "MissionBoard API",
        Version = "v1",
        Description = "Task Management System with Role-Based Access Control"
    });

    // JWT Authentication
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MissionBoard API v1");
        c.RoutePrefix = "swagger";
        c.DisplayRequestDuration();
    });
    app.UseCors("DevelopmentCors");
}

app.UseHttpsRedirection();

// Serve static files (for Angular app later)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedDatabase(context);
}

// Simple health check endpoint
app.MapGet("/health", () => "MissionBoard API is running!");

app.Logger.LogInformation("MissionBoard API starting up...");
app.Logger.LogInformation("Swagger UI available at: /swagger");

app.Run();

// Simple database seeding method
static async Task SeedDatabase(AppDbContext context)
{
    if (await context.Users.AnyAsync()) return; // Already seeded

    // Add some basic test data
    var adminRole = new MissionBoard.Api.Models.Role { Id = 1, Name = "Admin" };
    var managerRole = new MissionBoard.Api.Models.Role { Id = 2, Name = "Manager" };
    var devRole = new MissionBoard.Api.Models.Role { Id = 3, Name = "Developer" };

    context.Roles.AddRange(adminRole, managerRole, devRole);

    var admin = new MissionBoard.Api.Models.User
    {
        Id = "admin-1",
        UserName = "admin",
        Email = "admin@missionboard.com",
        PasswordHash = "admin123",
        IsActive = true
    };

    var manager = new MissionBoard.Api.Models.User
    {
        Id = "mgr-1",
        UserName = "manager",
        Email = "manager@missionboard.com",
        PasswordHash = "mgr123",
        IsActive = true
    };

    var dev = new MissionBoard.Api.Models.User
    {
        Id = "dev-1",
        UserName = "dev1",
        Email = "dev1@missionboard.com",
        PasswordHash = "dev123",
        IsActive = true
    };

    context.Users.AddRange(admin, manager, dev);

    await context.SaveChangesAsync();

    // Add user roles
    context.UserRoles.AddRange(
        new MissionBoard.Api.Models.UserRole { UserId = admin.Id, RoleId = adminRole.Id },
        new MissionBoard.Api.Models.UserRole { UserId = manager.Id, RoleId = managerRole.Id },
        new MissionBoard.Api.Models.UserRole { UserId = dev.Id, RoleId = devRole.Id }
    );

    // Add sample tasks
    var tasks = new[]
    {
        new MissionBoard.Api.Models.TaskItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = "Setup Development Environment",
            Description = "Configure the development environment with all necessary tools and dependencies",
            CreatedById = admin.Id,
            AssigneeId = dev.Id,
            Status = MissionBoard.Api.Models.TaskStatus.Done,
            Priority = MissionBoard.Api.Models.TaskPriority.High,
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new MissionBoard.Api.Models.TaskItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = "Implement User Authentication",
            Description = "Build JWT-based authentication system with role-based access control",
            CreatedById = manager.Id,
            AssigneeId = dev.Id,
            Status = MissionBoard.Api.Models.TaskStatus.InProgress,
            Priority = MissionBoard.Api.Models.TaskPriority.High,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow
        },
        new MissionBoard.Api.Models.TaskItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = "Design Task Management UI",
            Description = "Create wireframes and mockups for the task management interface",
            CreatedById = admin.Id,
            AssigneeId = null,
            Status = MissionBoard.Api.Models.TaskStatus.Backlog,
            Priority = MissionBoard.Api.Models.TaskPriority.Medium,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new MissionBoard.Api.Models.TaskItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = "Write Unit Tests",
            Description = "Add comprehensive unit tests for all core functionality",
            CreatedById = manager.Id,
            AssigneeId = dev.Id,
            Status = MissionBoard.Api.Models.TaskStatus.WithQA,
            Priority = MissionBoard.Api.Models.TaskPriority.Medium,
            CreatedAt = DateTime.UtcNow.AddHours(-6),
            UpdatedAt = DateTime.UtcNow.AddHours(-2)
        }
    };

    context.Tasks.AddRange(tasks);
    await context.SaveChangesAsync();
}
