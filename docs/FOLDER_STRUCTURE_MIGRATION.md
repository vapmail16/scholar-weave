# Folder Structure Migration Guide

## 📋 Overview

This document outlines the migration from the original flat folder structure to a more organized, scalable architecture for the ScholarWeave project.

## 🔄 What Changed

### Before (Original Structure)
```
scholar-weave/
├── src/                    # Frontend code mixed with config
├── backend/                # Backend code
├── public/                 # Static assets
├── docker-compose.yml      # Docker config in root
├── Dockerfile.frontend     # Docker files scattered
└── scripts/                # Scripts in root
```

### After (New Structure)
```
scholar-weave/
├── frontend/               # Complete frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Shared components
│   │   │   └── features/   # Feature-specific components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                # Complete backend application
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── database/       # Database layer
│   │   │   ├── models/     # Data models
│   │   │   ├── repositories/ # Repository implementations
│   │   │   └── migrations/ # Database migrations
│   │   └── ...
│   └── package.json        # Backend dependencies
├── shared/                 # Shared code
├── docker/                 # All Docker configuration
├── scripts/                # Project-wide scripts
└── docs/                   # Documentation
```

## 🎯 Benefits of New Structure

### 1. **Separation of Concerns**
- Frontend and backend are completely separate
- Clear boundaries between different layers
- Easier to maintain and scale

### 2. **Scalability**
- Easy to add new features without affecting existing code
- Clear organization makes onboarding new developers easier
- Better support for microservices architecture

### 3. **Maintainability**
- Related files are grouped together
- Clear import paths and dependencies
- Easier to find and fix issues

### 4. **Development Experience**
- Better IDE support with organized folders
- Clearer mental model of the application
- Easier to implement new features

## 📁 Directory Explanations

### Frontend Structure
```
frontend/src/
├── components/
│   ├── common/             # Reusable UI components
│   │   ├── Layout.tsx      # Main layout component
│   │   └── ui/             # shadcn/ui components
│   └── features/           # Feature-specific components
│       └── DatabaseToggle.tsx
├── pages/                  # Page components
├── services/               # API client and services
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── lib/                    # Utility libraries
└── styles/                 # CSS and styling
```

### Backend Structure
```
backend/src/
├── api/                    # Express routes and controllers
│   └── index.ts            # Main API entry point
├── database/               # Database layer
│   ├── models/             # Data models (MongoDB schemas)
│   ├── repositories/       # Repository implementations
│   └── migrations/         # Database migration scripts
├── services/               # Business logic services
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── middleware/             # Express middleware
```

### Shared Structure
```
shared/
├── types/                  # Shared TypeScript interfaces
└── constants/              # Shared constants and configuration
```

## 🔧 Migration Steps

### 1. **File Movement**
All files have been moved to their new locations:
- Frontend files → `frontend/`
- Backend files → `backend/`
- Docker files → `docker/`
- Scripts → `scripts/`
- Documentation → `docs/`

### 2. **Import Path Updates**
Import paths have been updated to reflect the new structure:
- `@/components/ui/` → `@/components/common/ui/`
- `@/components/Layout` → `@/components/common/Layout`
- `@/components/DatabaseToggle` → `@/components/features/DatabaseToggle`

### 3. **Configuration Updates**
- Frontend configuration moved to `frontend/`
- Backend configuration remains in `backend/`
- Docker configuration centralized in `docker/`

## 🚀 Working with the New Structure

### Development Commands
```bash
# Start frontend
cd frontend && npm run dev

# Start backend
cd backend && npm run dev

# Run setup script
./scripts/setup-project.sh

# Start Docker services
docker-compose -f docker/docker-compose.yml up -d
```

### Adding New Features

#### Frontend Components
```bash
# Common component (reusable)
touch frontend/src/components/common/NewComponent.tsx

# Feature component (specific to a feature)
touch frontend/src/components/features/NewFeature.tsx
```

#### Backend Features
```bash
# New API endpoint
touch backend/src/api/newEndpoint.ts

# New repository
touch backend/src/database/repositories/NewRepository.ts

# New model
touch backend/src/database/models/NewModel.ts
```

### Import Patterns

#### Frontend Imports
```typescript
// Common components
import { Button } from "@/components/common/ui/button";
import Layout from "@/components/common/Layout";

// Feature components
import DatabaseToggle from "@/components/features/DatabaseToggle";

// Pages
import Dashboard from "@/pages/Dashboard";

// Services
import { apiClient } from "@/services/api-client";
```

#### Backend Imports
```typescript
// Database layer
import { RepositoryFactory } from "@/database/repositories/RepositoryFactory";
import { PaperModel } from "@/database/models/mongodb/Paper";

// API layer
import { router } from "@/api/routes";

// Types
import { Paper, CreatePaperInput } from "@/types";
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Import Path Errors
If you see import path errors, check that the paths match the new structure:
- Update `@/components/ui/` to `@/components/common/ui/`
- Update component imports to use the new paths

#### 2. Missing Dependencies
If dependencies are missing, run:
```bash
cd frontend && npm install
cd backend && npm install
```

#### 3. Docker Issues
If Docker containers aren't starting, check:
```bash
# Check if Docker is running
docker --version

# Check container status
docker-compose -f docker/docker-compose.yml ps

# View logs
docker-compose -f docker/docker-compose.yml logs
```

### Getting Help

1. **Check the README.md** for the most up-to-date information
2. **Run the setup script** to ensure everything is configured correctly
3. **Check the docs/ directory** for specific documentation
4. **Review the import paths** in existing files for examples

## 📈 Future Improvements

### Planned Enhancements
1. **Shared Types**: Move common types to `shared/types/`
2. **API Documentation**: Add OpenAPI/Swagger documentation
3. **Testing Structure**: Organize tests to match the new structure
4. **CI/CD Pipeline**: Update deployment scripts for new structure

### Best Practices
1. **Keep components small and focused**
2. **Use consistent naming conventions**
3. **Group related functionality together**
4. **Document new features and changes**
5. **Follow the established import patterns**

## ✅ Migration Checklist

- [x] Move frontend files to `frontend/`
- [x] Move backend files to `backend/`
- [x] Update import paths
- [x] Move Docker files to `docker/`
- [x] Move scripts to `scripts/`
- [x] Move documentation to `docs/`
- [x] Update README.md
- [x] Create setup script
- [x] Test the new structure
- [x] Document the changes

The migration is complete and the new structure is ready for development! 🎉 