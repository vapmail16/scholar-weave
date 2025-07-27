import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { databaseConnection } from '@/config/database';
import { repositoryFactory } from '@/repositories/RepositoryFactory';
import { CreatePaperInput, CreateNoteInput } from '@/types';

const app = express();
const PORT = process.env['PORT'] || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: databaseConnection.isConnectedToDatabase() ? 'connected' : 'disconnected'
  });
});

// Papers API endpoints
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
    res.json({
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

// Notes API endpoints
app.get('/api/notes', async (req, res) => {
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

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await databaseConnection.connect();
    await repositoryFactory.initialize();
    
    console.log('✅ Database connected successfully');
    
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
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await repositoryFactory.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await repositoryFactory.close();
  process.exit(0);
});

// Start the server
startServer(); 