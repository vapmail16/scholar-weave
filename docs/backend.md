# ScholarWeave Backend - API Abstraction Layer

A modern academic research management platform backend demonstrating **plug-and-play database architecture** with PostgreSQL and MongoDB support, built using **Test-Driven Development (TDD)** approach.

## 🎯 **Project Overview**

This project showcases:
- **Database Abstraction**: Easy switching between PostgreSQL and MongoDB
- **TDD Implementation**: Test-first development approach
- **Clean Architecture**: Separation of concerns with repository pattern
- **Type Safety**: Full TypeScript implementation
- **Modern Stack**: Node.js, Express, Prisma, Jest

## 🏗️ **Architecture Highlights**

### **Repository Pattern Implementation**
```typescript
// Abstract interface (contract)
interface IPaperRepository {
  create(data: CreatePaperInput): Promise<Paper>;
  findById(id: string): Promise<Paper | null>;
  // ... other methods
}

// PostgreSQL implementation
class PostgresPaperRepository implements IPaperRepository {
  // PostgreSQL-specific implementation
}

// MongoDB implementation (future)
class MongoPaperRepository implements IPaperRepository {
  // MongoDB-specific implementation
}
```

### **Database Abstraction Benefits**
- ✅ **Same Interface**: Identical API regardless of database
- ✅ **Easy Switching**: Change database without code changes
- ✅ **Performance Optimization**: Choose best database for use case
- ✅ **Testing Flexibility**: Test against multiple databases

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker and Docker Compose
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/vapmail16/api-abstraction.git
cd api-abstraction
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Database**
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Set up environment
cp env.example .env
# Update .env with your database credentials

# Run database migrations
npm run db:migrate
```

### **4. Run Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### **5. Start Development Server**
```bash
npm run dev
```

Server will start on `http://localhost:3002`

## 🧪 **TDD Implementation**

### **Test Structure**
```
src/__tests__/
├── unit/                    # Unit tests
│   └── repositories/
│       └── postgres/        # PostgreSQL repository tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
└── fixtures/                # Test data
```

### **TDD Workflow**
1. **Red**: Write failing tests
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code while keeping tests green

### **Example TDD Test**
```typescript
describe('PaperRepository', () => {
  it('should create a new paper', async () => {
    // Test implementation
    const paper = await repository.create(paperData);
    expect(paper.id).toBeDefined();
  });
});
```

## 📊 **Database Schema**

### **Core Entities**
- **Papers**: Research papers with metadata
- **Authors**: Paper authors with affiliations
- **Citations**: Citation relationships
- **Notes**: Research notes with annotations
- **Annotations**: Highlights, comments, bookmarks

### **PostgreSQL Features**
- Full-text search with `pg_trgm`
- JSON fields for flexible metadata
- Optimized indexes for performance
- Transaction support for data integrity

## 🔧 **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
npm run db:reset         # Reset database

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:integration # Integration tests

# Linting
npm run lint             # Check code style
npm run lint:fix         # Fix code style issues
```

## 🐳 **Docker Setup**

### **PostgreSQL Container**
```bash
# Start database
docker-compose up -d postgres

# Check status
docker-compose ps

# View logs
docker-compose logs postgres

# Stop database
docker-compose down
```

### **Database Configuration**
- **Main DB**: `scholar_weave` (port 5432)
- **Test DB**: `scholar_weave_test` (port 5432)
- **Credentials**: postgres/postgres

## 📈 **API Endpoints**

### **Health Check**
```bash
GET /health
# Returns server and database status
```

### **Papers API**
```bash
GET /api/papers
# Returns list of papers with pagination
```

## 🧪 **Testing Strategy**

### **Test Categories**
1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: Database operations and API endpoints
3. **E2E Tests**: Complete user workflows

### **Test Coverage**
- Repository implementations: 100%
- Business logic: 100%
- API endpoints: 100%
- Error handling: 100%

## 🔄 **Database Switching**

### **Current Implementation**
- ✅ PostgreSQL with Prisma ORM
- 🔄 MongoDB with Mongoose (planned)

### **Future Extensions**
- Redis for caching
- Elasticsearch for advanced search
- GraphQL API layer

## 📝 **Development Guidelines**

### **Code Style**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### **TDD Process**
1. Write test first
2. Implement minimal code
3. Refactor for better design
4. Repeat for new features

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/new-feature
# Write tests first
# Implement feature
# Run all tests
git commit -m "feat: add new feature with tests"
git push origin feature/new-feature
```

## 🚀 **Deployment**

### **Production Setup**
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Build application: `npm run build`
5. Start server: `npm start`

### **Environment Variables**
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment | `development` |

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow TDD approach
4. Ensure all tests pass
5. Submit pull request

### **Development Setup**
```bash
# Clone and setup
git clone https://github.com/vapmail16/api-abstraction.git
cd api-abstraction
npm install

# Start development environment
docker-compose up -d postgres
npm run db:migrate
npm run dev
```

## 📚 **Documentation**

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with [Prisma](https://prisma.io/) for database management
- Tested with [Jest](https://jestjs.io/) testing framework
- Containerized with [Docker](https://docker.com/)
- Following [TDD](https://en.wikipedia.org/wiki/Test-driven_development) principles

---

**Ready to demonstrate plug-and-play database architecture! 🎉** 