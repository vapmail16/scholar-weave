# ScholarWeave - Research Paper Management System

A modern, full-stack application for managing research papers, notes, and citations with support for both MongoDB and PostgreSQL databases.

## 🏗️ Project Structure

```
scholar-weave/
├── frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared components (Layout, UI components)
│   │   │   └── features/       # Feature-specific components (DatabaseToggle)
│   │   ├── pages/              # Page components (Dashboard, Library, Notes, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript type definitions
│   │   ├── lib/                # Utility libraries
│   │   └── styles/             # CSS and styling files
│   └── public/                 # Static assets
├── backend/                     # Node.js + Express backend
│   ├── src/
│   │   ├── api/                # API routes and controllers
│   │   ├── database/           # Database-related code
│   │   │   ├── models/         # Database models (MongoDB schemas)
│   │   │   ├── repositories/   # Repository implementations
│   │   │   └── migrations/     # Database migration scripts
│   │   ├── services/           # Business logic services
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   └── middleware/         # Express middleware
│   └── tests/                  # Test files
├── config/                      # Centralized configuration files
│   ├── root/                   # Project-wide configuration
│   ├── frontend/               # Frontend-specific configuration
│   ├── backend/                # Backend-specific configuration
│   └── README.md               # Configuration documentation
├── shared/                      # Shared code between frontend/backend
│   ├── types/                  # Shared TypeScript types
│   └── constants/              # Shared constants
├── docker/                      # Docker configuration files
├── scripts/                     # Project-wide utility scripts
└── docs/                        # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### 1. Clone and Setup
```bash
git clone <repository-url>
cd scholar-weave
```

### 2. Start Services
```bash
# Start database containers
docker-compose -f docker/docker-compose.yml up -d postgres mongodb

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend (MongoDB by default)
cd backend && npm run dev

# Start frontend (in new terminal)
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🗄️ Database Support

The application supports both MongoDB and PostgreSQL with a seamless switching mechanism:

### Database Toggle
- **UI Component**: Located in the top-right corner of the application
- **Real-time Status**: Shows current database connection status
- **One-click Switching**: Switch between MongoDB and PostgreSQL
- **API Endpoint**: `POST /api/database/switch`

### Current Database Status
- **MongoDB**: 🍃 Green theme with leaf emoji
- **PostgreSQL**: 🐘 Blue theme with elephant emoji

## 📁 Key Directories Explained

### Frontend Structure
- **`components/common/`**: Reusable UI components (Layout, buttons, forms)
- **`components/features/`**: Feature-specific components (DatabaseToggle)
- **`pages/`**: Main application pages
- **`services/`**: API client and service layer
- **`hooks/`**: Custom React hooks for state management

### Backend Structure
- **`api/`**: Express routes and API endpoints
- **`database/models/`**: MongoDB schemas and Prisma models
- **`database/repositories/`**: Data access layer implementations
- **`database/migrations/`**: Database migration scripts
- **`services/`**: Business logic and domain services

### Shared Structure
- **`shared/types/`**: TypeScript interfaces shared between frontend/backend
- **`shared/constants/`**: Application constants and configuration

## 🔧 Configuration

### Centralized Configuration Structure
All configuration files are organized in the `config/` directory:

```bash
config/
├── root/           # Project-wide configuration (package.json, .gitignore, etc.)
├── frontend/       # Frontend configuration (vite.config.ts, tailwind.config.ts, etc.)
├── backend/        # Backend configuration (tsconfig.json, jest.config.js, etc.)
└── README.md       # Configuration documentation
```

### Configuration Management
Use the configuration management script to maintain the centralized structure:

```bash
# Check configuration status
./scripts/manage-config.sh status

# Fix broken symbolic links
./scripts/manage-config.sh fix-links

# Create configuration backup
./scripts/manage-config.sh backup

# Validate configuration files
./scripts/manage-config.sh validate
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_TYPE=mongodb|postgres
PORT=3001
MONGODB_URI=mongodb://localhost:27017/scholar_weave
POSTGRES_URI=postgresql://user:password@localhost:5432/scholar_weave

# Frontend (.env)
VITE_API_URL=http://localhost:3001
```

### Database Configuration
- **MongoDB**: Uses Mongoose ODM with embedded documents
- **PostgreSQL**: Uses Prisma ORM with relational schema
- **Repository Pattern**: Abstracted data access layer

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests (when implemented)
npm test
```

## 📚 API Endpoints

### Core Endpoints
- `GET /health` - Health check with database status
- `GET /api/papers` - Get all papers
- `POST /api/papers` - Create new paper
- `GET /api/papers/:id` - Get paper by ID
- `DELETE /api/papers/:id` - Delete paper
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/database/switch` - Switch database

### Available Repository Methods (Not Yet Exposed as APIs)
- **Papers**: 18+ methods (search, filter, citations, etc.)
- **Notes**: 13+ methods (annotations, tags, content search, etc.)
- **Citations**: 12+ methods (citation graphs, statistics, etc.)

## 🐳 Docker Support

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Start specific services
docker-compose -f docker/docker-compose.yml up -d postgres mongodb
```

## 📖 Documentation

- **Backend Docs**: `docs/backend.md`
- **MongoDB Implementation**: `docs/MONGODB_IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: Available at `/health` endpoint

## 🔄 Development Workflow

1. **Database Changes**: Update models in `backend/src/database/models/`
2. **API Changes**: Modify routes in `backend/src/api/`
3. **UI Changes**: Update components in `frontend/src/components/`
4. **Type Changes**: Update shared types in `shared/types/`

## 🎯 Features

- ✅ **Dual Database Support**: MongoDB and PostgreSQL
- ✅ **Real-time Database Toggle**: Switch databases via UI
- ✅ **Modern UI**: React + shadcn/ui + Tailwind CSS
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Repository Pattern**: Clean data access abstraction
- ✅ **Docker Support**: Containerized development environment
- ✅ **API-First Design**: RESTful API with comprehensive endpoints

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for type safety
3. Implement repository pattern for data access
4. Add tests for new features
5. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.
