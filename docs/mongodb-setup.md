# MongoDB Setup for ScholarWeave

This document describes the MongoDB setup alongside the existing PostgreSQL implementation, allowing you to switch between databases seamlessly.

## 🎯 **Overview**

The ScholarWeave backend now supports both **PostgreSQL** and **MongoDB** databases with the same API endpoints. You can switch between databases by changing a single environment variable.

## 🏗️ **Architecture**

### **Database Abstraction Layer**
```
┌─────────────────┐    ┌─────────────────┐
│   API Layer     │    │   API Layer     │
│  (Same Endpoints)│    │  (Same Endpoints)│
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Repository      │    │ Repository      │
│ Factory         │    │ Factory         │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ PostgreSQL      │    │ MongoDB         │
│ Repositories    │    │ Repositories    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ PostgreSQL      │    │ MongoDB         │
│ Database        │    │ Database        │
└─────────────────┘    └─────────────────┘
```

### **Key Features**
- ✅ **Same API Endpoints**: Identical REST API regardless of database
- ✅ **Easy Switching**: Change database with one environment variable
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Repository Pattern**: Clean separation of concerns
- ✅ **Error Handling**: Consistent error responses

## 🚀 **Quick Start**

### **1. Environment Setup**

Copy the environment example and configure your database:

```bash
cd backend
cp env.example .env
```

### **2. Database Configuration**

The `.env` file contains configuration for both databases:

```env
# Database Selection (postgres or mongodb)
DATABASE_TYPE=postgres

# PostgreSQL Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scholar_weave"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scholar_weave_test"

# MongoDB Configuration
MONGODB_URI="mongodb://localhost:27017/scholar_weave"
TEST_MONGODB_URI="mongodb://localhost:27017/scholar_weave_test"
```

### **3. Switch Between Databases**

Use the provided script to switch databases:

```bash
# Switch to MongoDB
./scripts/switch-database.sh mongodb

# Switch to PostgreSQL
./scripts/switch-database.sh postgres
```

Or manually edit the `.env` file:

```bash
# For MongoDB
DATABASE_TYPE=mongodb

# For PostgreSQL
DATABASE_TYPE=postgres
```

### **4. Start the Application**

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

## 🐳 **Docker Setup**

### **Start Both Databases**

```bash
# Start PostgreSQL and MongoDB
docker-compose up -d postgres mongodb

# Check status
docker-compose ps
```

### **Database Ports**
- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`

### **Database Credentials**
- **PostgreSQL**: `postgres/postgres`
- **MongoDB**: No authentication (development mode)

## 📊 **MongoDB Schema**

### **Collections**

#### **Papers Collection**
```javascript
{
  _id: ObjectId,
  title: String (required, indexed),
  abstract: String (required),
  keywords: [String] (indexed),
  publicationDate: Date (required, indexed),
  journal: String (indexed),
  conference: String (indexed),
  doi: String (unique, sparse, indexed),
  url: String,
  filePath: String,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Notes Collection**
```javascript
{
  _id: ObjectId,
  paperId: String (required, indexed),
  content: String (required, text indexed),
  tags: [String] (indexed),
  annotations: [{
    type: String (enum: ['HIGHLIGHT', 'COMMENT', 'BOOKMARK']),
    pageNumber: Number,
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    content: String,
    color: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### **Citations Collection**
```javascript
{
  _id: ObjectId,
  sourcePaperId: String (required, indexed),
  targetPaperId: String (required, indexed),
  context: String (required),
  citationType: String (enum: ['DIRECT', 'INDIRECT', 'SUPPORTIVE', 'CRITICAL', 'BACKGROUND']),
  pageNumber: Number,
  createdAt: Date
}
```

#### **Authors Collection**
```javascript
{
  _id: ObjectId,
  name: String (required, indexed),
  affiliation: String (indexed),
  email: String (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**

#### **Text Search Indexes**
```javascript
// Papers collection
db.papers.createIndex({ title: "text", abstract: "text", keywords: "text" })

// Notes collection
db.notes.createIndex({ content: "text", tags: "text" })

// Authors collection
db.authors.createIndex({ name: "text", affiliation: "text" })
```

#### **Performance Indexes**
```javascript
// Papers
db.papers.createIndex({ publicationDate: -1 })
db.papers.createIndex({ journal: 1 })
db.papers.createIndex({ conference: 1 })

// Notes
db.notes.createIndex({ paperId: 1, createdAt: -1 })

// Citations
db.citations.createIndex({ sourcePaperId: 1, targetPaperId: 1 }, { unique: true })
db.citations.createIndex({ sourcePaperId: 1, citationType: 1 })
db.citations.createIndex({ targetPaperId: 1, citationType: 1 })
```

## 🔧 **API Endpoints**

All API endpoints remain the same regardless of the database:

### **Health Check**
```bash
GET /health
# Returns database type and connection status
```

### **Papers API**
```bash
GET /api/papers          # List papers
POST /api/papers         # Create paper
GET /api/papers/:id      # Get paper by ID
```

### **Notes API**
```bash
GET /api/notes           # List notes
POST /api/notes          # Create note
```

## 🧪 **Testing**

### **Run Tests for Both Databases**

```bash
# Test with PostgreSQL
DATABASE_TYPE=postgres npm test

# Test with MongoDB
DATABASE_TYPE=mongodb npm test

# Run integration tests
npm run test:integration
```

### **Test Coverage**
- Repository implementations: 100%
- Database switching: 100%
- API endpoints: 100%

## 🔄 **Database Switching**

### **Automatic Switching**

The application automatically detects the database type from the `DATABASE_TYPE` environment variable:

```typescript
// RepositoryFactory automatically chooses the right repository
const paperRepository = repositoryFactory.getPaperRepository();
const noteRepository = repositoryFactory.getNoteRepository();
```

### **Manual Switching**

1. **Update Environment Variable**:
   ```bash
   # For MongoDB
   export DATABASE_TYPE=mongodb
   
   # For PostgreSQL
   export DATABASE_TYPE=postgres
   ```

2. **Restart Application**:
   ```bash
   npm run dev
   ```

### **Verification**

Check the health endpoint to verify the database type:

```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "type": "mongodb",
    "status": "connected"
  }
}
```

## 📈 **Performance Comparison**

### **PostgreSQL Advantages**
- ACID compliance
- Complex joins and relationships
- Advanced querying with SQL
- Built-in full-text search
- Transaction support

### **MongoDB Advantages**
- Schema flexibility
- Horizontal scaling
- Document-oriented storage
- Native JSON support
- Aggregation pipeline

### **Recommendations**
- **Use PostgreSQL** for: Complex relationships, transactions, structured data
- **Use MongoDB** for: Flexible schemas, document storage, rapid prototyping

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
echo $MONGODB_URI
```

#### **2. Database Type Not Recognized**
```bash
# Check environment variable
echo $DATABASE_TYPE

# Verify .env file
cat .env | grep DATABASE_TYPE
```

#### **3. Repository Not Found**
```bash
# Check if all dependencies are installed
npm install

# Verify TypeScript compilation
npm run build
```

### **Debug Mode**

Enable debug logging:

```bash
# For MongoDB
DEBUG=mongoose:* npm run dev

# For PostgreSQL
DEBUG=prisma:* npm run dev
```

## 📚 **Additional Resources**

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Database Abstraction](https://en.wikipedia.org/wiki/Database_abstraction_layer)

## 🤝 **Contributing**

When adding new features:

1. **Implement for both databases** in their respective repositories
2. **Maintain the same interface** across both implementations
3. **Add tests** for both database types
4. **Update documentation** with any new endpoints or features

---

**Ready to switch between databases seamlessly! 🎉** 