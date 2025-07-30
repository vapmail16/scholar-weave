# Scholar-Weave 📚

A modern research paper management system built with React, Node.js, and PostgreSQL/MongoDB.

## 🌟 Features

- **📄 Paper Management**: Upload, organize, and search research papers
- **📝 Note Taking**: Create and manage research notes with tags
- **🔗 Citation Network**: Explore and visualize citation relationships
- **🔄 Database Flexibility**: Support for PostgreSQL, MongoDB, and hybrid mode
- **📱 Modern UI**: Beautiful interface built with shadcn/ui components
- **⚡ Real-time Updates**: Live database switching and migration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Router** for navigation
- **React Query** for data fetching

### Backend
- **Node.js** with TypeScript
- **Express.js** for API
- **Prisma** for database ORM
- **Multer** for file uploads
- **CORS** and **Helmet** for security

### Database
- **PostgreSQL** for papers
- **MongoDB** for notes
- **Hybrid mode** support
- **Docker** for easy setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd scholar-weave
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment files**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your database settings
   
   # Frontend environment
   cd ../frontend
   echo "VITE_API_URL=http://localhost:3002" > .env
   ```

4. **Start the databases**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d postgres mongodb
   ```

5. **Start the application**
   ```bash
   # Start backend (in one terminal)
   cd backend
   npm run dev
   
   # Start frontend (in another terminal)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3002
   - Health Check: http://localhost:3002/health

## 📁 Project Structure

```
scholar-weave/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── database/       # Database models and repositories
│   │   └── index.ts        # Main entry point
│   ├── prisma/             # Database schema
│   └── uploads/            # Uploaded files
├── docker/                 # Docker configuration
├── config/                 # Shared configuration
└── scripts/                # Utility scripts
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scholar_weave"
MONGODB_URI="mongodb://localhost:27017/scholar_weave"
DATABASE_TYPE="hybrid"
PORT=3002
NODE_ENV=development
JWT_SECRET=your-secret-key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3002
```

## 📚 API Endpoints

### Papers
- `GET /api/papers` - Get all papers
- `POST /api/papers` - Create paper
- `POST /api/papers/upload` - Upload PDF file
- `GET /api/papers/:id` - Get specific paper
- `DELETE /api/papers/:id` - Delete paper

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `DELETE /api/notes/:id` - Delete note

### Database
- `GET /health` - Health check
- `POST /api/database/switch` - Switch database type
- `POST /api/database/migrate` - Migrate between databases
- `GET /api/database/stats` - Get database statistics

## 🎯 Usage

### Uploading Papers
1. Click "Import Your First Paper" or the upload button
2. Select a PDF file (max 10MB)
3. Add optional metadata (title, authors, abstract)
4. Click "Upload Paper"

### Managing Notes
1. Navigate to the Notes section
2. Create new notes with tags
3. Link notes to papers
4. Search and filter notes

### Database Management
1. Use the database toggle in the header
2. Switch between PostgreSQL, MongoDB, and hybrid modes
3. Migrate data between databases
4. View real-time statistics

## 🐳 Docker Support

Run the entire application with Docker:

```bash
docker-compose up --build
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

**Built with ❤️ for researchers and academics**
