import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RepositoryFactory } from '../database/repositories/RepositoryFactory';
import { databaseConnection } from '../database';
import { mongodbConnection } from '../mongodb';
import { CreatePaperInput, CreateNoteInput } from '../index';

const app = express();
const PORT = process.env['PORT'] || 3002;

// Initialize repository factory
const repositoryFactory = RepositoryFactory.getInstance();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Error handling for multer
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only PDF files are allowed'
    });
  }
  next(error);
});

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

// File upload endpoint for papers
app.post('/api/papers/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const paperRepository = repositoryFactory.getPaperRepository();
    
    // Create paper with file information
    const paperData: CreatePaperInput = {
      title: req.body.title || req.file.originalname.replace('.pdf', ''),
      authors: req.body.authors ? JSON.parse(req.body.authors) : [],
      abstract: req.body.abstract || '',
      keywords: req.body.keywords ? JSON.parse(req.body.keywords) : [],
      publicationDate: req.body.publicationDate || new Date().toISOString(),
      journal: req.body.journal || '',
      doi: req.body.doi || '',
      url: req.body.url || '',
      filePath: req.file.path,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    };

    const paper = await paperRepository.create(paperData);
    
    res.status(201).json({
      status: 'success',
      message: 'Paper uploaded successfully',
      data: paper
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Upload failed'
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

    console.log(`🔄 Starting migration from ${fromDatabase} to ${toDatabase}`);

    // Step 1: Connect to source database and get all data
    const originalType = process.env['DATABASE_TYPE'];
    process.env['DATABASE_TYPE'] = fromDatabase;
    await repositoryFactory.initialize();
    
    const sourcePaperRepo = repositoryFactory.getPaperRepository();
    const sourceNoteRepo = repositoryFactory.getNoteRepository();
    
    // Get all papers and notes from source database
    const sourcePapers = await sourcePaperRepo.findAll(10000); // Get all papers
    const sourceNotes = await sourceNoteRepo.findAll(10000); // Get all notes
    
    console.log(`📊 Found ${sourcePapers.length} papers and ${sourceNotes.length} notes in ${fromDatabase}`);

    // Step 2: Connect to target database
    process.env['DATABASE_TYPE'] = toDatabase;
    await repositoryFactory.initialize();
    
    const targetPaperRepo = repositoryFactory.getPaperRepository();
    const targetNoteRepo = repositoryFactory.getNoteRepository();

    // Step 3: Migrate papers (with duplicate handling)
    let migratedPapers = 0;
    let skippedPapers = 0;
    for (const paper of sourcePapers) {
      try {
        // Check if paper already exists in target database (by DOI or title)
        let existingPaper = null;
        if (paper.doi) {
          existingPaper = await targetPaperRepo.findByDoi(paper.doi);
        }
        if (!existingPaper && paper.title) {
          // If no DOI match, try to find by title
          const papersByTitle = await targetPaperRepo.findByKeyword(paper.title);
          existingPaper = papersByTitle.find(p => p.title.toLowerCase() === paper.title.toLowerCase());
        }
        
        if (existingPaper) {
          console.log(`⏭️ Paper "${paper.title}" already exists in target database, skipping`);
          skippedPapers++;
          continue;
        }
        
        // Create paper in target database
        await targetPaperRepo.create({
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          keywords: paper.keywords,
          publicationDate: paper.publicationDate,
          journal: paper.journal,
          doi: paper.doi,
          url: paper.url,
          filePath: paper.filePath,
          metadata: paper.metadata
        });
        migratedPapers++;
        console.log(`✅ Migrated paper: "${paper.title}"`);
      } catch (error) {
        console.error(`❌ Failed to migrate paper ${paper.id}:`, error);
      }
    }

    // Step 4: Migrate notes (with duplicate handling)
    let migratedNotes = 0;
    let skippedNotes = 0;
    for (const note of sourceNotes) {
      try {
        // Check if note already exists in target database (by content and paperId)
        let existingNotes = [];
        if (note.paperId) {
          existingNotes = await targetNoteRepo.findByPaperId(note.paperId);
        } else {
          // For notes without paperId, check by content
          existingNotes = await targetNoteRepo.findByContent(note.content.substring(0, 100)); // First 100 chars
        }
        
        // Check if a similar note already exists
        const similarNote = existingNotes.find(existing => 
          existing.content === note.content && 
          JSON.stringify(existing.tags.sort()) === JSON.stringify(note.tags.sort())
        );
        
        if (similarNote) {
          console.log(`⏭️ Note already exists in target database, skipping`);
          skippedNotes++;
          continue;
        }
        
        // Create note in target database
        await targetNoteRepo.create({
          paperId: note.paperId,
          content: note.content,
          tags: note.tags,
          annotations: note.annotations
        });
        migratedNotes++;
        console.log(`✅ Migrated note`);
      } catch (error) {
        console.error(`❌ Failed to migrate note ${note.id}:`, error);
      }
    }

    // Step 5: Verify migration was successful
    const targetPapers = await targetPaperRepo.findAll(10000);
    const targetNotes = await targetNoteRepo.findAll(10000);

    console.log(`✅ Migration completed: ${migratedPapers} papers and ${migratedNotes} notes migrated`);
    console.log(`⏭️ Skipped: ${skippedPapers} papers and ${skippedNotes} notes (already exist in target)`);

    // Step 6: Delete data from source database (only if migration was successful)
    const totalProcessedPapers = migratedPapers + skippedPapers;
    const totalProcessedNotes = migratedNotes + skippedNotes;
    
    if (totalProcessedPapers === sourcePapers.length && totalProcessedNotes === sourceNotes.length) {
      console.log(`🗑️ Deleting migrated data from source database ${fromDatabase}`);
      
      // Connect back to source database
      process.env['DATABASE_TYPE'] = fromDatabase;
      await repositoryFactory.initialize();
      
      const sourcePaperRepoForDelete = repositoryFactory.getPaperRepository();
      const sourceNoteRepoForDelete = repositoryFactory.getNoteRepository();
      
      // Delete all papers from source
      for (const paper of sourcePapers) {
        try {
          await sourcePaperRepoForDelete.delete(paper.id);
        } catch (error) {
          console.error(`❌ Failed to delete paper ${paper.id} from source:`, error);
        }
      }
      
      // Delete all notes from source
      for (const note of sourceNotes) {
        try {
          await sourceNoteRepoForDelete.delete(note.id);
        } catch (error) {
          console.error(`❌ Failed to delete note ${note.id} from source:`, error);
        }
      }
      
      console.log(`✅ Successfully deleted ${sourcePapers.length} papers and ${sourceNotes.length} notes from ${fromDatabase}`);
    } else {
      console.log(`⚠️ Migration incomplete. Not deleting source data to prevent data loss.`);
    }

    // Step 7: Restore original database type
    process.env['DATABASE_TYPE'] = originalType;
    await repositoryFactory.initialize();
    
    const isCompleteMigration = totalProcessedPapers === sourcePapers.length && totalProcessedNotes === sourceNotes.length;
    
    let message = '';
    if (isCompleteMigration) {
      if (migratedPapers > 0 || migratedNotes > 0) {
        message = `Successfully moved ${migratedPapers} papers and ${migratedNotes} notes from ${fromDatabase} to ${toDatabase}`;
        if (skippedPapers > 0 || skippedNotes > 0) {
          message += ` (${skippedPapers} papers and ${skippedNotes} notes already existed in target)`;
        }
      } else {
        message = `All data already exists in target database. No migration needed.`;
      }
    } else {
      message = `Partially processed ${totalProcessedPapers} papers and ${totalProcessedNotes} notes from ${fromDatabase} to ${toDatabase} (source data preserved)`;
    }
    
    return res.json({
      status: 'success',
      message: message,
      migration: {
        papers: {
          source: sourcePapers.length,
          target: targetPapers.length,
          migrated: migratedPapers,
          skipped: skippedPapers,
          moved: isCompleteMigration
        },
        notes: {
          source: sourceNotes.length,
          target: targetNotes.length,
          migrated: migratedNotes,
          skipped: skippedNotes,
          moved: isCompleteMigration
        }
      },
      database: {
        type: originalType,
        status: 'connected'
      }
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Migration failed'
    });
  }
});

// Database statistics endpoint
app.get('/api/database/stats', async (req, res) => {
  try {
    const { type } = req.query;
    
    if (!type || !['mongodb', 'postgres'].includes(type as string)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid database type. Must be "mongodb" or "postgres"'
      });
    }

    const databaseType = type as 'mongodb' | 'postgres';
    
    // Temporarily switch to the requested database to get stats
    const originalType = process.env['DATABASE_TYPE'];
    process.env['DATABASE_TYPE'] = databaseType;
    await repositoryFactory.initialize();
    
    // Get document counts
    const paperRepository = repositoryFactory.getPaperRepository();
    const noteRepository = repositoryFactory.getNoteRepository();
    
    const papers = await paperRepository.findAll(1000); // Get all papers for count
    const notes = await noteRepository.findAll(1000); // Get all notes for count
    
    // Restore original database type
    process.env['DATABASE_TYPE'] = originalType;
    await repositoryFactory.initialize();
    
    // Check connection status
    const isConnected = databaseType === 'mongodb' 
      ? mongodbConnection.isConnectedToDatabase()
      : databaseConnection.isConnectedToDatabase();
    
    return res.json({
      status: 'success',
      papers: papers.length,
      notes: notes.length,
      database: {
        type: databaseType,
        status: isConnected ? 'connected' : 'disconnected'
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