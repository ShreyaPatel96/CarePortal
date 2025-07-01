# Care Portal - Full-Stack Care Management System

A comprehensive full-stack care management system built with **React + TypeScript** frontend and **.NET 9.0** backend API. This application provides complete client management, document handling, incident tracking, and job time logging capabilities with real-time data synchronization.

![Care Portal](https://img.shields.io/badge/Care%20Portal-Full%20Stack-blue)
![.NET](https://img.shields.io/badge/.NET-9.0-purple)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Care Portal is a modern, full-stack web application designed for healthcare and care management organizations. It provides a comprehensive solution for managing clients, documents, incidents, and job time tracking with a responsive web interface and robust backend API.

### Key Capabilities

- **Client Management**: Complete CRUD operations for client records
- **Document Management**: File upload, storage, and document lifecycle management
- **Incident Tracking**: Record and monitor incidents with severity levels
- **Job Time Logging**: Track staff work hours and activities
- **User Management**: Role-based access control and user administration
- **Dashboard Analytics**: Real-time statistics and activity monitoring

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication with automatic token refresh
- Role-based access control (Admin, Manager, Staff)
- Secure password management with change/reset capabilities
- Session management and logout functionality

### 📊 Dashboard & Analytics

- Real-time dashboard with key metrics
- Recent activity feed
- Statistical overview of clients, incidents, and documents
- Interactive charts and data visualization

### 👥 Client Management

- Complete client profile management
- Search and filtering capabilities
- Status tracking and updates
- Staff assignment and relationship management

### 📄 Document Management

- Multi-format file upload support
- Document categorization and status tracking
- Search and filter functionality
- Secure file storage and download

### 🚨 Incident Management

- Incident creation and tracking
- Severity level classification
- Status workflow management
- Client association and reporting

### ⏱️ Job Time Management

- Time tracking for staff activities
- Job type categorization
- Client association
- Reporting and analytics

### 🎨 User Interface

- Responsive design for all devices
- Modern, intuitive interface
- Real-time data updates
- Loading states and error handling
- Toast notifications for user feedback

## 🛠️ Technology Stack

### Frontend

- React 18.3.1 + TypeScript 5.5.3
- Vite 5.4.2 + Tailwind CSS 3.4.1
- React Router DOM 7.6.2 + Axios 1.10.0

### Backend

- .NET 9.0 + Entity Framework Core
- ASP.NET Core Web API + JWT Authentication
- SQL Server/SQLite + Swagger/OpenAPI

## 🚀 Quick Start

### Backend Setup

```bash
cd CarePortal
dotnet restore

# Configure your database connection
# Copy the template and update with your settings
cp CarePortal.Api/appsettings.Template.json CarePortal.Api/appsettings.json
# Edit appsettings.json with your database server and JWT secret

cd CarePortal.Api
dotnet ef database update
dotnet run
```

### Frontend Setup

```bash
cd src
npm install
npm run dev
```

## 🔐 Security Configuration

### Important Security Notes

⚠️ **Before making your repository public, ensure you have:**

1. **Updated Connection Strings**: Replace placeholder values in `appsettings.json`
2. **Generated Secure JWT Secret**: Use a strong, unique secret key
3. **Configured File Upload Paths**: Set appropriate paths for your environment
4. **Added Sensitive Files to .gitignore**: Ensure no secrets are committed

### Configuration Setup

1. **Copy the template configuration**:

   ```bash
   cp CarePortal.Api/appsettings.Template.json CarePortal.Api/appsettings.json
   ```

2. **Update the configuration file** with your settings:

   - Replace `YOUR_SERVER_NAME` with your SQL Server instance
   - Replace `YOUR_SUPER_SECRET_KEY_HERE_THAT_IS_AT_LEAST_32_CHARACTERS_LONG` with a secure JWT secret
   - Update file upload paths as needed

3. **Generate a secure JWT secret**:

   ```bash
   # Using PowerShell
   [System.Web.Security.Membership]::GeneratePassword(64, 10)

   # Or use an online generator (for development only)
   # https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
   ```

### Environment Variables (Alternative)

For production deployments, consider using environment variables:

```bash
# Set environment variables
setx ConnectionStrings__DefaultConnection "Your_Connection_String"
setx JwtSettings__SecretKey "Your_JWT_Secret"
```

### Database Setup

The application supports both SQL Server and SQLite:

**SQL Server**:

```json
"DefaultConnection": "Server=YOUR_SERVER;Database=CarePortalDb;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=true;"
```

**SQLite** (for development):

```json
"DefaultConnection": "Data Source=CarePortal.db"
```

## 📡 API Endpoints

- **Authentication**: `/api/auth/*`
- **Clients**: `/api/clients/*`
- **Documents**: `/api/documents/*`
- **Incidents**: `/api/incidents/*`
- **Job Times**: `/api/jobtimes/*`
- **Dashboard**: `/api/dashboard/*`

## 🔐 Default Login

- Email: `admin@careportal.com`
- Password: `Admin@123`

## 📁 Project Structure

```
project/
├── CarePortal/          # .NET 9.0 Backend
│   ├── CarePortal.Api/
│   ├── CarePortal.Application/
│   ├── CarePortal.Domain/
│   ├── CarePortal.Infrastructure/
│   ├── CarePortal.Persistence/
│   └── CarePortal.Shared/
└── src/                 # React + TypeScript Frontend
    ├── components/
    ├── services/
    ├── contexts/
    └── hooks/
```

## 🏗️ Architecture

- **Clean Architecture** with separation of concerns
- **Repository Pattern** for data access
- **JWT Authentication** with role-based access
- **Responsive Design** with modern UI/UX

## 📄 License

MIT License

## 🔒 Making Repository Public Safely

### Before Making Public

1. **Check for Sensitive Data**:

   ```bash
   # Search for potential secrets in your codebase
   git log --all --full-history -- "*.json"
   git log --all --full-history -- "*.config"
   ```

2. **Verify .gitignore**:

   - Ensure `appsettings.Production.json` is in `.gitignore`
   - Check that no database files are committed
   - Verify no API keys or secrets are exposed

3. **Update Configuration**:
   - All connection strings use placeholder values
   - JWT secrets are generic placeholders
   - File paths are relative or generic

### Repository Visibility Settings

According to [GitHub's repository visibility documentation](https://docs.github.com/articles/setting-repository-visibility), when making a repository public:

- **Code becomes visible to everyone** who can visit GitHub.com
- **Anyone can fork your repository**
- **Actions history and logs become visible**
- **Stars and watchers are permanently erased**

### Security Checklist

- [ ] Connection strings use placeholder values
- [ ] JWT secrets are generic placeholders
- [ ] No real API keys in configuration files
- [ ] Database files are in `.gitignore`
- [ ] Upload directories are excluded
- [ ] Environment-specific files are ignored
- [ ] Template configuration file is provided
- [ ] Security documentation is included

### After Making Public

1. **Monitor for Issues**: Check if any sensitive data was accidentally exposed
2. **Update Documentation**: Ensure setup instructions are clear
3. **Community Guidelines**: Consider adding contribution guidelines
4. **Security Policy**: Add a SECURITY.md file if needed

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js 18+** and npm
- **.NET 9.0 SDK**
- **SQL Server** (or SQLite for development)
- **Git** for version control
- **Visual Studio 2022** or **VS Code** (recommended)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup (.NET 9.0)

```bash
# Navigate to backend directory
cd CarePortal

# Restore .NET dependencies
dotnet restore

# Update database connection string in CarePortal.Api/appsettings.json
# For SQL Server:
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CarePortalDb;Trusted_Connection=true;MultipleActiveResultSets=true"
}

# For SQLite (development):
"ConnectionStrings": {
  "DefaultConnection": "Data Source=CarePortal.db"
}

# Run database migrations
cd CarePortal.Api
dotnet ef database update

# Run the backend API
dotnet run
```

The API will be available at `https://localhost:7188/api`
Swagger documentation: `https://localhost:7188/swagger`

### 3. Frontend Setup (React + TypeScript)

```bash
# Navigate to frontend directory (from project root)
cd src

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=https://localhost:7188/api
VITE_APP_NAME=Care Portal
```

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/api/auth/login`           | User login with email/password |
| POST   | `/api/auth/refresh-token`   | Refresh JWT token              |
| POST   | `/api/auth/logout`          | User logout                    |
| POST   | `/api/auth/change-password` | Change user password           |
| POST   | `/api/auth/reset-password`  | Reset password                 |

### Client Management

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/clients`      | Get all clients   |
| GET    | `/api/clients/{id}` | Get client by ID  |
| POST   | `/api/clients`      | Create new client |
| PUT    | `/api/clients/{id}` | Update client     |
| DELETE | `/api/clients/{id}` | Delete client     |

### Document Management

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/api/documents`               | Get all documents   |
| GET    | `/api/documents/{id}`          | Get document by ID  |
| POST   | `/api/documents`               | Upload new document |
| PUT    | `/api/documents/{id}`          | Update document     |
| DELETE | `/api/documents/{id}`          | Delete document     |
| GET    | `/api/documents/download/{id}` | Download document   |

### Incident Management

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/incidents`      | Get all incidents   |
| GET    | `/api/incidents/{id}` | Get incident by ID  |
| POST   | `/api/incidents`      | Create new incident |
| PUT    | `/api/incidents/{id}` | Update incident     |
| DELETE | `/api/incidents/{id}` | Delete incident     |

### Job Time Management

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/jobtimes`      | Get all job times   |
| GET    | `/api/jobtimes/{id}` | Get job time by ID  |
| POST   | `/api/jobtimes`      | Create new job time |
| PUT    | `/api/jobtimes/{id}` | Update job time     |
| DELETE | `/api/jobtimes/{id}` | Delete job time     |

### Dashboard & Analytics

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/api/dashboard/stats`           | Get dashboard statistics |
| GET    | `/api/dashboard/recent-activity` | Get recent activity      |

### Example API Requests

#### Login Request

```json
{
  "email": "admin@careportal.com",
  "password": "Admin@123"
}
```

#### Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "...",
    "email": "admin@careportal.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["Admin"],
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "...",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

## 🎨 Frontend Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ClientManagement.tsx
│   ├── Dashboard.tsx
│   ├── DocumentManagement.tsx
│   ├── IncidentManagement.tsx
│   ├── JobTimeManagement.tsx
│   ├── UserManagement.tsx
│   ├── Layout.tsx
│   ├── LoginForm.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorDisplay.tsx
│   └── FileUpload.tsx
├── contexts/            # React context providers
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── services/            # API service layer
│   ├── api.ts
│   ├── authService.ts
│   ├── clientService.ts
│   ├── dashboardService.ts
│   ├── documentService.ts
│   ├── fileUploadService.ts
│   ├── incidentService.ts
│   ├── jobTimeService.ts
│   ├── metadataService.ts
│   └── userService.ts
├── hooks/               # Custom React hooks
│   ├── useEnumMapping.ts
│   └── useToast.ts
├── utils/               # Utility functions
│   └── errorHandler.ts
├── config/              # Configuration files
│   └── config.ts
├── App.tsx
└── main.tsx
```

### Key Components

- **Layout.tsx**: Main application layout with navigation
- **Dashboard.tsx**: Overview dashboard with statistics
- **ClientManagement.tsx**: Client CRUD operations
- **DocumentManagement.tsx**: Document upload and management
- **IncidentManagement.tsx**: Incident tracking and reporting
- **JobTimeManagement.tsx**: Time tracking interface
- **UserManagement.tsx**: User administration

### State Management

- **AuthContext**: Manages authentication state and user session
- **DataContext**: Provides global data access and caching
- **React Query**: For server state management (if implemented)

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support (if implemented)

## 🔧 Backend Development

### Clean Architecture Layers

#### 1. Domain Layer (CarePortal.Domain)

- **Entities**: Core business objects
  - `ApplicationUser`, `ApplicationRole`
  - `Client`, `ClientDocument`
  - `JobTime`, `Incident`
- **Enums**: Business enumerations
  - `UserRole`, `DocumentStatus`, `IncidentSeverity`
- **Extensions**: Domain-specific extensions

#### 2. Application Layer (CarePortal.Application)

- **DTOs**: Data transfer objects
- **Interfaces**: Service contracts
- **Services**: Business logic implementation
- **Repository**: Data access interfaces

#### 3. Infrastructure Layer (CarePortal.Infrastructure)

- **Services**: External service implementations
  - `TokenService`, `FileUploadService`
- **Repositories**: Data access implementations

#### 4. Persistence Layer (CarePortal.Persistence)

- **Context**: Entity Framework DbContext
- **Migrations**: Database schema changes
- **Seeder**: Initial data seeding

#### 5. API Layer (CarePortal.Api)

- **Controllers**: HTTP endpoints
- **Middleware**: Request/response processing
- **Configuration**: Application settings

### Key Services

- **AuthService**: Authentication and authorization
- **ClientService**: Client management operations
- **DocumentService**: Document handling and storage
- **IncidentService**: Incident tracking and reporting
- **JobTimeService**: Time tracking operations
- **UserService**: User management and administration

## 🗄️ Database Schema

### Core Entities

#### ApplicationUser

```sql
- Id (string, PK)
- UserName (string)
- Email (string)
- FirstName (string)
- LastName (string)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### Client

```sql
- Id (int, PK)
- Name (string)
- Email (string)
- Phone (string)
- Address (string)
- AssignedStaffId (string, FK)
- Status (enum)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

#### ClientDocument

```sql
- Id (int, PK)
- ClientId (int, FK)
- FileName (string)
- FilePath (string)
- FileSize (long)
- DocumentType (enum)
- Status (enum)
- UploadedById (string, FK)
- CreatedAt (DateTime)
```

#### JobTime

```sql
- Id (int, PK)
- StaffId (string, FK)
- ClientId (int, FK)
- StartTime (DateTime)
- EndTime (DateTime)
- ActivityType (enum)
- Description (string)
- CreatedAt (DateTime)
```

#### Incident

```sql
- Id (int, PK)
- JobTimeId (int, FK)
- Title (string)
- Description (string)
- Severity (enum)
- Status (enum)
- ReportedById (string, FK)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

## 🔐 Authentication & Security

### JWT Configuration

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyHereThatIsAtLeast32CharactersLong",
    "Issuer": "CarePortal",
    "Audience": "CarePortal",
    "ExpiresInMinutes": 60
  }
}
```

### Role-Based Authorization

- **Admin**: Full system access
- **Manager**: Limited administrative access
- **Staff**: Basic operational access

### Security Features

- JWT token authentication
- Automatic token refresh
- Role-based access control
- Secure password hashing
- CSRF protection
- Input validation and sanitization

## 🚀 Usage

### Default Login Credentials

- **Email**: `admin@careportal.com`
- **Password**: `Admin@123`

### Getting Started

1. **Start the Backend**: Run the .NET API
2. **Start the Frontend**: Run the React development server
3. **Login**: Use the default admin credentials
4. **Explore**: Navigate through different modules

### Key Workflows

#### Client Management

1. Navigate to "Clients" section
2. Click "Add New Client" to create a client
3. Fill in client details and assign staff
4. Save and manage client information

#### Document Upload

1. Go to "Documents" section
2. Click "Upload Document"
3. Select file and choose document type
4. Associate with client if needed
5. Upload and track document status

#### Incident Reporting

1. Navigate to "Incidents" section
2. Click "Report Incident"
3. Fill in incident details and severity
4. Associate with job time if applicable
5. Submit and track incident status

#### Time Tracking

1. Go to "Job Times" section
2. Click "Log Time"
3. Select client and activity type
4. Enter start/end times and description
5. Save time entry

## 🛠️ Development

### Backend Development

```bash
# Run in development mode
cd CarePortal/CarePortal.Api
dotnet run

# Run tests
cd CarePortal
dotnet test

# Create new migration
cd CarePortal.Api
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

### Frontend Development

```bash
# Start development server
cd src
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Code Quality

- **Backend**: Follow C# coding conventions
- **Frontend**: Use ESLint and Prettier
- **Testing**: Unit tests for both layers
- **Documentation**: Inline code documentation

## 🚀 Deployment

### Backend Deployment

#### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CarePortal.Api/CarePortal.Api.csproj", "CarePortal.Api/"]
RUN dotnet restore "CarePortal.Api/CarePortal.Api.csproj"
COPY . .
WORKDIR "/src/CarePortal.Api"
RUN dotnet build "CarePortal.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CarePortal.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CarePortal.Api.dll"]
```

#### Azure Deployment

1. Create Azure App Service
2. Configure connection string
3. Deploy using Azure CLI or GitHub Actions

### Frontend Deployment

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify Deployment

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Environment Variables

#### Backend (.NET)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your-production-connection-string"
  },
  "JwtSettings": {
    "SecretKey": "your-production-secret-key"
  }
}
```

#### Frontend (React)

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=Care Portal
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Email**: support@careportal.com
- **Documentation**: [API Documentation](https://localhost:7188/swagger)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Care Portal** - Empowering care management with modern technology.
