# ScholarWeave - Complete Project Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [MCP Implementation](#mcp-implementation)
8. [Frontend Implementation](#frontend-implementation)
9. [Backend Implementation](#backend-implementation)
10. [Docker Configuration](#docker-configuration)
11. [Setup & Installation](#setup--installation)
12. [Usage Guide](#usage-guide)
13. [Development Workflow](#development-workflow)
14. [Testing Strategy](#testing-strategy)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [Contributing](#contributing)

---

## 🎯 Project Overview

### Purpose
ScholarWeave is a modern research paper management system designed to help researchers, academics, and students organize, search, and manage their research papers and notes efficiently.

### Key Features
- **Paper Management**: Upload, organize, and search research papers
- **Note Taking**: Create and manage research notes with tags
- **Citation Network**: Explore and visualize citation relationships
- **Database Flexibility**: Support for PostgreSQL, MongoDB, and hybrid mode
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Real-time Updates**: Live database switching and migration
- **MCP Integration**: Model Context Protocol for AI integration

### Benefits
- **Centralized Research Management**: All papers and notes in one place
- **Advanced Search**: Find papers by title, author, keywords, or content
- **Citation Tracking**: Understand research relationships and impact
- **Flexible Database**: Choose between PostgreSQL, MongoDB, or hybrid
- **AI-Ready**: MCP integration enables AI-powered research assistance
- **Modern Architecture**: Scalable, maintainable, and extensible

---

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Databases     │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│  PostgreSQL     │
│                 │    │                 │    │   MongoDB       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │    │   MCP Server    │    │   Docker        │
│   (External)    │◄──►│   (Tools)       │    │   Containers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Frontend Architecture
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **React Router**: Client-side routing
- **React Query**: Server state management

#### Backend Architecture
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe backend development
- **Prisma**: Database ORM and migrations
- **Repository Pattern**: Clean data access layer
- **Factory Pattern**: Dynamic database switching
- **MCP Server**: Model Context Protocol implementation

#### Database Architecture
- **PostgreSQL**: Primary relational database
- **MongoDB**: Document database for flexible data
- **Hybrid Mode**: Use both databases simultaneously
- **Prisma Migrations**: Version-controlled schema changes
- **Connection Pooling**: Efficient database connections

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Type safety |
| Vite | 5.4.1 | Build tool |
| Tailwind CSS | 3.4.11 | Styling |
| shadcn/ui | Latest | UI components |
| React Router | 6.26.2 | Routing |
| React Query | 5.56.2 | Data fetching |
| Lucide React | 0.462.0 | Icons |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | Latest | Web framework |
| TypeScript | 5.5.3 | Type safety |
| Prisma | 5.22.0 | Database ORM |
| PostgreSQL | 15 | Primary database |
| MongoDB | 7.0 | Document database |
| Multer | Latest | File uploads |
| CORS | Latest | Cross-origin requests |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Git | Version control |
| GitHub | Code hosting |
| npm | Package management |

---

## 📁 Project Structure

```
scholar-weave/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── common/     # Shared components
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── ui/     # shadcn/ui components
│   │   │   └── features/   # Feature-specific components
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Library.tsx
│   │   │   ├── Notes.tsx
│   │   │   ├── Citations.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/       # API services
│   │   │   ├── api-client.ts
│   │   │   ├── papers-api.ts
│   │   │   ├── notes-api.ts
│   │   │   └── citations-api.ts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── api/            # API routes and controllers
│   │   │   └── index.ts    # Main API server
│   │   ├── database/       # Database layer
│   │   │   ├── postgres/   # PostgreSQL repositories
│   │   │   └── mongodb/    # MongoDB repositories
│   │   ├── mcp/            # MCP implementation
│   │   │   ├── server.ts   # MCP server
│   │   │   └── api.ts      # MCP API endpoints
│   │   ├── repositories/   # Repository pattern implementation
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Prisma schema
│   │   └── migrations/     # Database migrations
│   ├── uploads/            # File upload directory
│   └── package.json        # Backend dependencies
├── mcp-client/             # MCP client demo application
│   ├── index.ts            # Client implementation
│   ├── package.json        # Client dependencies
│   └── README.md           # Client documentation
├── docker/                 # Docker configuration
│   ├── docker-compose.yml  # Multi-container setup
│   ├── Dockerfile.frontend # Frontend container
│   └── backend.Dockerfile  # Backend container
├── config/                 # Configuration files
│   ├── backend/            # Backend configuration
│   ├── frontend/           # Frontend configuration
│   └── root/               # Root configuration
├── scripts/                # Utility scripts
│   ├── setup-project.sh    # Project setup
│   ├── run-docker.sh       # Docker management
│   └── manage-config.sh    # Configuration management
├── docs/                   # Documentation
├── package.json            # Root package.json
└── README.md              # Project overview
```

---

## 🗄️ Database Design

### PostgreSQL Schema

#### Papers Table
```sql
CREATE TABLE papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[],
    publication_date TIMESTAMP(3) NOT NULL,
    journal TEXT,
    conference TEXT,
    doi TEXT UNIQUE,
    url TEXT,
    file_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

#### Authors Table
```sql
CREATE TABLE authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    affiliation TEXT,
    email TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

#### Paper Authors Table
```sql
CREATE TABLE paper_authors (
    id TEXT PRIMARY KEY,
    paper_id TEXT NOT NULL REFERENCES papers(id),
    author_id TEXT NOT NULL REFERENCES authors(id),
    order_index INTEGER DEFAULT 0,
    UNIQUE(paper_id, author_id)
);
```

#### Notes Table
```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    paper_id TEXT REFERENCES papers(id),
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

#### Citations Table
```sql
CREATE TABLE citations (
    id TEXT PRIMARY KEY,
    source_paper_id TEXT NOT NULL REFERENCES papers(id),
    target_paper_id TEXT NOT NULL REFERENCES papers(id),
    context TEXT NOT NULL,
    citation_type CITATION_TYPE NOT NULL,
    page_number INTEGER,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_paper_id, target_paper_id)
);
```

### MongoDB Collections

#### Papers Collection
```javascript
{
  _id: ObjectId,
  title: String,
  abstract: String,
  keywords: [String],
  authors: [{
    name: String,
    affiliation: String,
    email: String
  }],
  publicationDate: Date,
  journal: String,
  conference: String,
  doi: String,
  url: String,
  filePath: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes Collection
```javascript
{
  _id: ObjectId,
  paperId: ObjectId,
  content: String,
  tags: [String],
  annotations: [{
    type: String,
    pageNumber: Number,
    position: Object,
    content: String,
    color: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Documentation

### Core API Endpoints

#### Papers API
```http
GET /api/papers
POST /api/papers
GET /api/papers/:id
DELETE /api/papers/:id
POST /api/papers/upload
```

#### Notes API
```http
GET /api/notes
POST /api/notes
DELETE /api/notes/:id
```

#### Database Management
```http
GET /health
POST /api/database/switch
GET /api/database/stats
```

### MCP API Endpoints

#### Tool Discovery
```http
GET /api/mcp/tools
```

#### Tool Execution
```http
POST /api/mcp/tools/call
{
  "name": "fetch_papers",
  "arguments": {
    "limit": 10,
    "search": "machine learning"
  }
}
```

#### Convenience Endpoints
```http
GET /api/mcp/papers?limit=10&search=machine+learning
GET /api/mcp/papers/:id
GET /api/mcp/notes?limit=20&paperId=123
GET /api/mcp/notes/:id
GET /api/mcp/papers/:paperId/notes
```

### Request/Response Examples

#### Fetch Papers
```bash
curl -X GET "http://localhost:3002/api/papers?limit=5&search=machine+learning"
```

Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "paper-123",
      "title": "Machine Learning Applications",
      "authors": ["John Doe", "Jane Smith"],
      "abstract": "This paper explores...",
      "keywords": ["machine learning", "AI"],
      "publicationDate": "2023-01-15T00:00:00.000Z",
      "journal": "Journal of AI",
      "doi": "10.1234/example",
      "createdAt": "2023-01-15T00:00:00.000Z",
      "updatedAt": "2023-01-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Upload Paper
```bash
curl -X POST "http://localhost:3002/api/papers/upload" \
  -F "file=@paper.pdf" \
  -F "title=Research Paper Title" \
  -F "authors=[\"Author 1\", \"Author 2\"]" \
  -F "abstract=Paper abstract here"
```

---

## 🤖 MCP Implementation

### MCP Server Architecture

The MCP server provides a standardized interface for AI models to interact with ScholarWeave:

#### Tool Definitions
```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
```

#### Available Tools

1. **fetch_papers**
   - **Purpose**: Fetch research papers with filtering
   - **Parameters**: limit, offset, search, author, journal, dateFrom, dateTo, tags
   - **Returns**: Array of paper objects

2. **fetch_paper_by_id**
   - **Purpose**: Fetch specific paper by ID
   - **Parameters**: id (required)
   - **Returns**: Single paper object

3. **fetch_notes**
   - **Purpose**: Fetch research notes with filtering
   - **Parameters**: limit, offset, paperId, tags, search
   - **Returns**: Array of note objects

4. **fetch_note_by_id**
   - **Purpose**: Fetch specific note by ID
   - **Parameters**: id (required)
   - **Returns**: Single note object

5. **fetch_notes_by_paper**
   - **Purpose**: Fetch notes for specific paper
   - **Parameters**: paperId (required), limit
   - **Returns**: Array of note objects

### MCP Client Implementation

The MCP client demonstrates how external applications can use the MCP tools:

```typescript
class ScholarWeaveMCPClient {
  // Health check
  async checkHealth(): Promise<any>
  
  // Tool discovery
  async discoverTools(): Promise<any>
  
  // Tool execution
  async executeTool(name: string, args?: any): Promise<any>
  
  // Convenience methods
  async fetchPapers(options?: PaperOptions): Promise<any>
  async fetchPaperById(id: string): Promise<any>
  async fetchNotes(options?: NoteOptions): Promise<any>
  async fetchNoteById(id: string): Promise<any>
  async fetchNotesByPaper(paperId: string, limit?: number): Promise<any>
}
```

### Usage Examples

#### Tool Discovery
```typescript
const client = new ScholarWeaveMCPClient();
const tools = await client.discoverTools();
console.log(`Available tools: ${tools.count}`);
```

#### Fetch Papers
```typescript
// Using MCP tool
const papers = await client.executeTool('fetch_papers', {
  limit: 10,
  search: 'machine learning'
});

// Using REST endpoint
const papersRest = await client.fetchPapers({
  limit: 10,
  search: 'machine learning'
});
```

---

## 🎨 Frontend Implementation

### Component Architecture

#### Layout Components
- **Layout.tsx**: Main application layout with navigation
- **Sidebar.tsx**: Navigation sidebar
- **Header.tsx**: Application header with database toggle

#### Page Components
- **Dashboard.tsx**: Overview and statistics
- **Library.tsx**: Paper management interface
- **Notes.tsx**: Note management interface
- **Citations.tsx**: Citation network visualization
- **Settings.tsx**: Application settings

#### UI Components (shadcn/ui)
- **Button**: Interactive buttons
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Form**: Form components
- **Table**: Data tables
- **Toast**: Notification system

### State Management

#### React Query
```typescript
// Papers query
const { data: papers, isLoading } = useQuery({
  queryKey: ['papers', filters],
  queryFn: () => papersApi.getPapers(filters)
});

// Create paper mutation
const createPaper = useMutation({
  mutationFn: papersApi.createPaper,
  onSuccess: () => {
    queryClient.invalidateQueries(['papers']);
  }
});
```

#### Local State
```typescript
// Form state
const [formData, setFormData] = useState({
  title: '',
  authors: [],
  abstract: ''
});

// UI state
const [isUploading, setIsUploading] = useState(false);
const [selectedPaper, setSelectedPaper] = useState(null);
```

### Routing

```typescript
// App routing
<Router>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/library" element={<Library />} />
    <Route path="/notes" element={<Notes />} />
    <Route path="/citations" element={<Citations />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Router>
```

---

## ⚙️ Backend Implementation

### Repository Pattern

The backend uses the Repository pattern to abstract database operations:

#### Repository Interface
```typescript
interface IPaperRepository {
  create(data: CreatePaperInput): Promise<Paper>;
  findById(id: string): Promise<Paper | null>;
  findAll(limit?: number, offset?: number): Promise<Paper[]>;
  update(id: string, data: UpdatePaperInput): Promise<Paper | null>;
  delete(id: string): Promise<boolean>;
  search(params: SearchParams): Promise<PaginatedResponse<Paper>>;
}
```

#### Implementation
```typescript
class PostgresPaperRepository implements IPaperRepository {
  async create(data: CreatePaperInput): Promise<Paper> {
    return await prisma.paper.create({
      data: {
        id: generateId(),
        ...data
      }
    });
  }
  
  async findAll(limit = 10, offset = 0): Promise<Paper[]> {
    return await prisma.paper.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

### Factory Pattern

The Repository Factory manages database switching:

```typescript
class RepositoryFactory {
  private static instance: RepositoryFactory;
  private paperRepository: IPaperRepository;
  private noteRepository: INoteRepository;
  
  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }
  
  async initialize(): Promise<void> {
    const dbType = process.env.DATABASE_TYPE || 'postgres';
    
    if (dbType === 'postgres') {
      this.paperRepository = new PostgresPaperRepository();
      this.noteRepository = new PostgresNoteRepository();
    } else if (dbType === 'mongodb') {
      this.paperRepository = new MongoPaperRepository();
      this.noteRepository = new MongoNoteRepository();
    }
  }
  
  getPaperRepository(): IPaperRepository {
    return this.paperRepository;
  }
  
  getNoteRepository(): INoteRepository {
    return this.noteRepository;
  }
}
```

### API Controllers

#### Papers Controller
```typescript
// GET /api/papers
app.get('/api/papers', async (req, res) => {
  try {
    const paperRepository = repositoryFactory.getPaperRepository();
    const papers = await paperRepository.findAll(10);
    
    res.json({
      status: 'success',
      data: papers,
      count: papers.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
```

#### File Upload
```typescript
// POST /api/papers/upload
app.post('/api/papers/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const paperData: CreatePaperInput = {
      title: req.body.title || req.file.originalname,
      authors: JSON.parse(req.body.authors || '[]'),
      abstract: req.body.abstract || '',
      filePath: req.file.path,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    };
    
    const paper = await paperRepository.create(paperData);
    
    res.status(201).json({
      status: 'success',
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
```

---

## 🐳 Docker Configuration

### Docker Compose Setup

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: scholar-weave-postgres
    environment:
      POSTGRES_DB: scholar_weave
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - scholar-weave-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: scholar-weave-mongodb
    environment:
      MONGO_INITDB_DATABASE: scholar_weave
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - scholar-weave-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: scholar-weave-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/scholar_weave
      MONGODB_URI: mongodb://mongodb:27017/scholar_weave
      DATABASE_TYPE: postgres
      NODE_ENV: production
      PORT: 3002
    ports:
      - "3002:3002"
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
    networks:
      - scholar-weave-network
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: sh -c "npx prisma migrate deploy && npm start"

  # Frontend React App
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: scholar-weave-frontend
    environment:
      VITE_API_URL: http://localhost:3002
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - scholar-weave-network

volumes:
  postgres_data:
  mongodb_data:

networks:
  scholar-weave-network:
    driver: bridge
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3002

# Start the application
CMD ["npm", "start"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/vapmail16/scholar-weave.git
cd scholar-weave
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. **Set up environment files**
```bash
# Backend environment
cd backend
cp config/backend/env.example .env
# Edit .env with your database settings

# Frontend environment
cd ../frontend
echo "VITE_API_URL=http://localhost:3002" > .env
```

4. **Start databases**
```bash
docker-compose -f docker/docker-compose.yml up -d postgres mongodb
```

5. **Run database migrations**
```bash
cd backend
npx prisma migrate deploy
```

6. **Start the application**
```bash
# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### Docker Setup

1. **Build and start all services**
```bash
docker-compose -f docker/docker-compose.yml up --build
```

2. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- Health Check: http://localhost:3002/health

### MCP Client Setup

1. **Navigate to MCP client directory**
```bash
cd mcp-client
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the demo**
```bash
npm start
```

---

## 📖 Usage Guide

### Paper Management

#### Upload a Paper
1. Navigate to the Library page
2. Click "Upload Paper" button
3. Select a PDF file (max 10MB)
4. Fill in paper metadata:
   - Title
   - Authors
   - Abstract
   - Keywords
   - Journal/Conference
   - DOI
5. Click "Upload"

#### Search Papers
1. Use the search bar in the Library
2. Filter by:
   - Title/Abstract content
   - Author name
   - Journal
   - Publication date
   - Keywords

#### View Paper Details
1. Click on a paper in the Library
2. View:
   - Full metadata
   - Abstract
   - Authors
   - File download
   - Associated notes
   - Citations

### Note Management

#### Create a Note
1. Navigate to the Notes page
2. Click "Create Note"
3. Fill in:
   - Content
   - Tags
   - Associated paper (optional)
4. Click "Save"

#### Organize Notes
1. Use tags to categorize notes
2. Filter notes by:
   - Tags
   - Associated paper
   - Content search
3. Sort by creation date

### Database Management

#### Switch Database
1. Go to Settings page
2. Select database type:
   - PostgreSQL
   - MongoDB
   - Hybrid
3. Click "Switch Database"

#### View Database Stats
1. Navigate to Dashboard
2. View:
   - Total papers
   - Total notes
   - Database type
   - Connection status

### MCP Integration

#### Discover Tools
```bash
curl http://localhost:3002/api/mcp/tools
```

#### Execute Tools
```bash
curl -X POST http://localhost:3002/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fetch_papers",
    "arguments": {
      "limit": 10,
      "search": "machine learning"
    }
  }'
```

#### Use REST Endpoints
```bash
# Fetch papers
curl "http://localhost:3002/api/mcp/papers?limit=5&search=AI"

# Fetch notes
curl "http://localhost:3002/api/mcp/notes?limit=10"

# Fetch specific paper
curl "http://localhost:3002/api/mcp/papers/paper-id"
```

---

## 🔄 Development Workflow

### Code Organization

#### Frontend Structure
```
frontend/src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

#### Backend Structure
```
backend/src/
├── api/                # API routes and controllers
├── database/           # Database layer
├── mcp/                # MCP implementation
├── repositories/       # Repository pattern
├── services/           # Business logic
├── middleware/         # Express middleware
├── types/              # TypeScript types
└── utils/              # Utility functions
```

### Development Commands

#### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

#### Backend Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

#### Database Management
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Git Workflow

1. **Create feature branch**
```bash
git checkout -b feature/new-feature
```

2. **Make changes and commit**
```bash
git add .
git commit -m "feat: add new feature"
```

3. **Push to remote**
```bash
git push origin feature/new-feature
```

4. **Create pull request**
- Go to GitHub repository
- Create new pull request
- Add description and review

---

## 🧪 Testing Strategy

### Frontend Testing

#### Unit Tests
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { PaperCard } from './PaperCard';

test('renders paper title', () => {
  const paper = {
    id: '1',
    title: 'Test Paper',
    authors: ['Author 1']
  };
  
  render(<PaperCard paper={paper} />);
  expect(screen.getByText('Test Paper')).toBeInTheDocument();
});
```

#### Integration Tests
```typescript
// API integration test
import { papersApi } from '../services/papers-api';

test('fetches papers successfully', async () => {
  const papers = await papersApi.getPapers({ limit: 5 });
  expect(papers).toHaveLength(5);
});
```

### Backend Testing

#### Unit Tests
```typescript
// Repository test example
import { PostgresPaperRepository } from './PostgresPaperRepository';

test('creates paper successfully', async () => {
  const repository = new PostgresPaperRepository();
  const paperData = {
    title: 'Test Paper',
    abstract: 'Test abstract'
  };
  
  const paper = await repository.create(paperData);
  expect(paper.title).toBe('Test Paper');
});
```

#### API Tests
```typescript
// API endpoint test
import request from 'supertest';
import app from '../src/api';

test('GET /api/papers returns papers', async () => {
  const response = await request(app)
    .get('/api/papers')
    .expect(200);
  
  expect(response.body.status).toBe('success');
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

### MCP Testing

#### Tool Execution Tests
```typescript
// MCP tool test
import { ScholarWeaveMCPServer } from './server';

test('fetch_papers tool works correctly', async () => {
  const server = new ScholarWeaveMCPServer();
  const result = await server.executeTool('fetch_papers', { limit: 5 });
  
  expect(result.isError).toBe(false);
  expect(Array.isArray(result.content)).toBe(true);
});
```

---

## 🚀 Deployment

### Production Environment

#### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://user:password@host:5432/database
MONGODB_URI=mongodb://user:password@host:27017/database
DATABASE_TYPE=postgres
NODE_ENV=production
PORT=3002
JWT_SECRET=your-secret-key

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

#### Docker Deployment
```bash
# Build production images
docker-compose -f docker/docker-compose.yml build

# Start production services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      
      - name: Build
        run: |
          cd frontend && npm run build
          cd ../backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port is in use
lsof -i :3002

# Kill process using port
kill -9 <PID>

# Check database connection
curl http://localhost:3002/health
```

#### Database Connection Issues
```bash
# Check PostgreSQL
docker exec -it scholar-weave-postgres psql -U postgres -d scholar_weave

# Check MongoDB
docker exec -it scholar-weave-mongodb mongosh

# Reset database
npx prisma migrate reset
```

#### Frontend Build Issues
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm run build -- --force
```

#### MCP Client Issues
```bash
# Check MCP server health
curl http://localhost:3002/api/mcp/health

# Test tool discovery
curl http://localhost:3002/api/mcp/tools

# Check client configuration
cat mcp-client/index.ts
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_papers_title ON papers(title);
CREATE INDEX idx_papers_authors ON papers USING GIN(authors);
CREATE INDEX idx_notes_content ON notes USING GIN(to_tsvector('english', content));
```

#### Frontend Optimization
```typescript
// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

// Use React.memo for expensive components
const PaperCard = React.memo(({ paper }) => {
  return <div>{paper.title}</div>;
});

// Implement lazy loading
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

#### Backend Optimization
```typescript
// Implement caching
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 });

// Add to repository methods
async findAll(limit = 10, offset = 0): Promise<Paper[]> {
  const cacheKey = `papers_${limit}_${offset}`;
  let papers = cache.get(cacheKey);
  
  if (!papers) {
    papers = await prisma.paper.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
    cache.set(cacheKey, papers);
  }
  
  return papers;
}
```

---

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
```bash
git clone https://github.com/yourusername/scholar-weave.git
cd scholar-weave
```

3. **Create feature branch**
```bash
git checkout -b feature/your-feature
```

4. **Make changes and test**
```bash
# Run tests
npm test

# Check linting
npm run lint

# Build project
npm run build
```

5. **Commit and push**
```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

6. **Create pull request**

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type when possible
- Use proper error handling

#### React
- Use functional components with hooks
- Implement proper prop types
- Use React.memo for performance
- Follow React best practices

#### Backend
- Use async/await for database operations
- Implement proper error handling
- Use repository pattern
- Follow REST API conventions

#### Testing
- Write unit tests for all functions
- Implement integration tests
- Use proper test naming conventions
- Maintain good test coverage

### Pull Request Guidelines

1. **Clear description** of changes
2. **Screenshots** for UI changes
3. **Tests** for new functionality
4. **Documentation** updates
5. **No breaking changes** without migration guide

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful UI components
- **Prisma** for the excellent database ORM
- **Vite** for the fast build tool
- **React Query** for server state management
- **Tailwind CSS** for the utility-first CSS framework

---

*This documentation is maintained by the ScholarWeave development team. For questions or contributions, please open an issue or pull request on GitHub.* 