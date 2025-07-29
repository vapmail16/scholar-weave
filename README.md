# ScholarWeave 🧠📚

A comprehensive research paper management system with dual database support (MongoDB & PostgreSQL) built with modern web technologies.

## ✨ Features

### 🔄 **Dual Database Support**
- **MongoDB**: Flexible document-based storage
- **PostgreSQL**: Relational database with ACID compliance
- **Runtime Database Switching**: Switch between databases without restart
- **Repository Pattern**: Clean abstraction layer for database operations

### 📄 **Core Functionality**
- **Paper Management**: Upload, organize, and search research papers
- **Note Taking**: Create and manage notes with tags and annotations
- **Citation Tracking**: Track and manage citations between papers
- **Advanced Search**: Full-text search with filters and sorting

### 🎨 **Modern Frontend**
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive design
- **shadcn/ui** components for consistent UI
- **Database Toggle** for easy switching between MongoDB and PostgreSQL

### 🚀 **Backend Architecture**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for PostgreSQL
- **MongoDB Native Driver** for MongoDB
- **Repository Pattern** for clean data access

### 🐳 **DevOps & Deployment**
- **Docker** configuration for easy deployment
- **Docker Compose** for local development
- **Environment-based configuration**
- **Database migration scripts**

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - PostgreSQL ORM
- **MongoDB Driver** - MongoDB access
- **Jest** - Testing

### Database
- **PostgreSQL** - Primary relational database
- **MongoDB** - Document database
- **Docker** - Containerization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/tangy83/scholar-weave.git
cd scholar-weave
```

### 2. Start Databases with Docker
```bash
# Start PostgreSQL and MongoDB
docker-compose -f docker/docker-compose.yml up -d
```

### 3. Setup Backend
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run build
npm start
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017

## 📁 Project Structure

```
scholar-weave/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── database/       # Database models and repositories
│   │   │   ├── models/     # MongoDB models
│   │   │   └── repositories/ # Repository implementations
│   │   └── index.ts        # Main server file
│   ├── prisma/             # Prisma schema and migrations
│   └── tests/              # Backend tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── docker/                 # Docker configuration
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DATABASE_TYPE=mongodb  # or postgres
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/scholar_weave

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scholar_weave
```

## 🗄️ Database Switching

The application supports runtime database switching:

### Via API
```bash
# Switch to MongoDB
curl -X POST http://localhost:3001/api/database/switch \
  -H "Content-Type: application/json" \
  -d '{"databaseType": "mongodb"}'

# Switch to PostgreSQL
curl -X POST http://localhost:3001/api/database/switch \
  -H "Content-Type: application/json" \
  -d '{"databaseType": "postgres"}'
```

### Via Frontend
Use the Database Toggle component in the Settings page to switch between databases.

## 📚 API Endpoints

### Papers
- `GET /api/papers` - List all papers
- `POST /api/papers` - Create new paper
- `GET /api/papers/:id` - Get paper by ID
- `PUT /api/papers/:id` - Update paper
- `DELETE /api/papers/:id` - Delete paper

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get note by ID
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Citations
- `GET /api/citations` - List all citations
- `POST /api/citations` - Create new citation
- `GET /api/citations/:id` - Get citation by ID

### Database
- `POST /api/database/switch` - Switch database type
- `GET /api/database/status` - Get current database status

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Production
```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Prisma** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework
- **React** team for the amazing frontend framework

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/tangy83/scholar-weave/issues)
3. Create a new issue with detailed information

---

**Built with ❤️ for the research community**
