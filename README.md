# MissionBoard - Task Management System

A comprehensive task management system with role-based access control (RBAC), built with ASP.NET Core and Angular.

## Features

- **Role-Based Access Control (RBAC)** - Five distinct roles: Admin, Manager, Developer, QA, Business
- **JWT Authentication** - Secure, stateless authentication with role and rights claims
- **Team Management** - Organize users into teams with manager oversight
- **Task Kanban Board** - Drag-and-drop task management with status tracking
- **Real-time Updates** - NgRx state management for responsive UI
- **Comprehensive API** - RESTful endpoints with OpenAPI documentation
- **Responsive Design** - Mobile-friendly interface

## Architecture

### Backend (ASP.NET Core)
- **Controllers**: RESTful API endpoints with authorization policies
- **Services**: Business logic layer with dependency injection
- **Models**: Entity Framework Core models with relationships
- **Authorization**: Custom policy-based authorization with rights checking
- **Middleware**: Global exception handling and JWT validation

### Frontend (Angular + NgRx)
- **Components**: Modular, reusable UI components
- **State Management**: NgRx for predictable state management
- **Services**: HTTP client services with interceptors
- **Guards**: Route protection based on authentication and roles
- **Effects**: Side effect management for API calls

### Database
- **Development**: Entity Framework Core In-Memory database
- **Production**: Configurable for SQL Server, PostgreSQL, etc.

## 🔧 Prerequisites

- .NET 8 SDK
- Node.js 18+
- Angular CLI 16+

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd MissionBoard
```

### 2. Backend Setup

```bash
cd backend/MissionBoard.Api
dotnet restore
dotnet build
```

### 3. Frontend Setup

```bash
cd apps/missionboard-frontend
npm install
ng build --configuration production
```

### 4. Run the Application

```bash
# From backend/MissionBoard.Api directory
dotnet run

# Application will be available at:
# - API: https://localhost:7001
# - Frontend: https://localhost:7001 (served by backend)
# - Swagger UI: https://localhost:7001/swagger
```

## Demo Credentials

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | admin123 | Full system access |
| Manager | manager1 | manager123 | Team Alpha manager |
| Manager | manager2 | manager123 | Team Beta manager |
| Developer | dev1 | dev123 | Alpha team developer |
| Developer | dev2 | dev123 | Beta team developer |

## Role Permissions

### Admin
- Full system access
- User and role management
- All task operations
- System configuration

### Manager
- Create and assign tasks
- View all team tasks
- Manage team members
- Task status oversight

### Developer
- Update task status
- Comment on tasks
- View assigned and team tasks


## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user info

### Tasks
- `GET /api/tasks` - List tasks (filtered by permissions)
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status
- `POST /api/tasks/{id}/assign` - Assign task
- `DELETE /api/tasks/{id}` - Delete task

### API Documentation
Complete API documentation is available at `/swagger` when running the application.


```

## Security Considerations

### Development- 
- JWT key stored in `appsettings.Development.json`
- CORS enabled for localhost

### Production Recommendations

1. **Password Security**
   ```csharp
   // Replace DevPasswordHasher with:
   services.AddScoped<IPasswordHasher, ProductionPasswordHasher>();

   // Use BCrypt.Net-Next or Microsoft.AspNetCore.Identity
   ```

2. **JWT Key Management**
   ```json
   // Use Azure Key Vault, AWS Secrets Manager, or similar
   "Jwt": {
     "Key": "${JWT_SIGNING_KEY}",  // Environment variable
     "Issuer": "YourProductionIssuer",
     "Audience": "YourProductionAudience"
   }
   ```

3. **Database**
   ```csharp
   // Configure for production database
   services.AddDbContext<AppDbContext>(options =>
       options.UseSqlServer(connectionString));
   ```

4. **HTTPS & Security Headers**
   - Enable HTTPS redirection
   - Add security headers middleware
   - Configure CORS for production domains only

## 🌍 Environment Configuration

### Backend Configuration
```json
{
  "Jwt": {
    "Key": "YourSecretKeyHere",
    "Issuer": "MissionBoard",
    "Audience": "MissionBoard-Client",
    "ExpiresInMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=...;"
  }
}
```

### Frontend Configuration
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com'
};
```


