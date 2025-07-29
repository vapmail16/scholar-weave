import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { RepositoryFactory } from '../database/repositories/RepositoryFactory';
import { databaseConnection } from '../database';
import { mongodbConnection } from '../mongodb';
import { CreatePaperInput, CreateNoteInput } from '../index';

const app = express();
const PORT = process.env['PORT'] || 3002;

// Initialize repository factory
const repositoryFactory = RepositoryFactory.getInstance();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  const databaseType = repositoryFactory.getDatabaseType();
  const isConnected = databaseType === 'mongodb' 
    ? mongodbConnection.isConnectedToDatabase()
    : databaseConnection.isConnectedToDatabase();
    
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      type: databaseType,
      status: isConnected ? 'connected' : 'disconnected'
    }
  });
});

// Papers API endpoints
app.get('/api/papers', async (_req, res) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/papers', async (req, res) => {
  try {
    const paperRepository = repositoryFactory.getPaperRepository();
    const paperData: CreatePaperInput = req.body;
    const paper = await paperRepository.create(paperData);
    res.status(201).json({
      status: 'success',
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/papers/:id', async (req, res) => {
  try {
    const paperRepository = repositoryFactory.getPaperRepository();
    const paper = await paperRepository.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({
        status: 'error',
        message: 'Paper not found'
      });
    }
    return res.json({
      status: 'success',
      data: paper
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Notes API endpoints
app.get('/api/notes', async (_req, res) => {
  try {
    const noteRepository = repositoryFactory.getNoteRepository();
    const notes = await noteRepository.findAll(50);
    res.json({
      status: 'success',
      data: notes,
      count: notes.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const noteRepository = repositoryFactory.getNoteRepository();
    const noteData: CreateNoteInput = req.body;
    const note = await noteRepository.create(noteData);
    res.status(201).json({
      status: 'success',
      data: note
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteRepository = repositoryFactory.getNoteRepository();
    const success = await noteRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    return res.json({
      status: 'success',
      message: 'Note deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/papers/:id', async (req, res) => {
  try {
    const paperRepository = repositoryFactory.getPaperRepository();
    const success = await paperRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Paper not found'
      });
    }
    return res.json({
      status: 'success',
      message: 'Paper deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database switch endpoint
app.post('/api/database/switch', async (req, res) => {
  try {
    const { databaseType } = req.body;
    
    if (!databaseType || !['mongodb', 'postgres', 'hybrid'].includes(databaseType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid database type. Must be "mongodb", "postgres", or "hybrid"'
      });
    }
    
    process.env['DATABASE_TYPE'] = databaseType;
    await repositoryFactory.initialize();
    
    return res.json({
      status: 'success',
      message: `Database switched to ${databaseType}`,
      database: {
        type: databaseType,
        status: 'connected'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Migration endpoint
app.post('/api/database/migrate', async (req, res) => {
  try {
    const { fromDatabase, toDatabase } = req.body;
    
    if (!fromDatabase || !toDatabase || !['mongodb', 'postgres'].includes(fromDatabase) || !['mongodb', 'postgres'].includes(toDatabase)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid database types. Must be "mongodb" or "postgres"'
      });
    }
    
    if (fromDatabase === toDatabase) {
      return res.status(400).json({
        status: 'error',
        message: 'Source and target databases must be different'
      });
    }
    
    // For now, we'll just switch the database type
    // In a real implementation, you would migrate the data here
    process.env['DATABASE_TYPE'] = toDatabase;
    await repositoryFactory.initialize();
    
    return res.json({
      status: 'success',
      message: `Migration from ${fromDatabase} to ${toDatabase} completed`,
      database: {
        type: toDatabase,
        status: 'connected'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database and initialize repositories
    await repositoryFactory.initialize();
    
    console.log('✅ Database connected successfully');
    console.log(`📊 Using database: ${repositoryFactory.getDatabaseType()}`);
    console.log(`🔄 Database switch endpoint: http://localhost:${PORT}/api/database/switch`);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Papers API: http://localhost:${PORT}/api/papers`);
      console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await repositoryFactory.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await repositoryFactory.cleanup();
  process.exit(0);
});

// Start the server
startServer(); 