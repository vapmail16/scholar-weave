import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { PaperModel } from '../src/models/mongodb/Paper';
import { NoteModel } from '../src/models/mongodb/Note';
import { AuthorModel } from '../src/models/mongodb/Author';
import { CitationModel } from '../src/models/mongodb/Citation';

const prisma = new PrismaClient();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholar_weave';

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function migratePapers() {
  console.log('📚 Migrating papers...');
  
  const papers = await prisma.paper.findMany({
    include: {
      authors: {
        include: {
          author: true,
        },
      },
      citations: true,
    },
  });

  console.log(`Found ${papers.length} papers to migrate`);

  for (const paper of papers) {
    try {
      // Create authors in MongoDB
      const authorIds = [];
      for (const paperAuthor of paper.authors) {
        const author = paperAuthor.author;
        if (author.name) { // Only create author if name exists
          const mongoAuthor = new AuthorModel({
            name: author.name,
            email: author.email || '',
            affiliation: author.affiliation || '',
            orcid: '', // orcid not in Prisma schema
          });
          const savedAuthor = await mongoAuthor.save();
          authorIds.push(savedAuthor._id.toString());
        }
      }

      // Create paper in MongoDB
      const mongoPaper = new PaperModel({
        title: paper.title,
        abstract: paper.abstract,
        keywords: paper.keywords,
        publicationDate: paper.publicationDate,
        journal: paper.journal,
        conference: paper.conference,
        doi: paper.doi,
        url: paper.url,
        filePath: paper.filePath,
        metadata: paper.metadata || {},
      });

      const savedPaper = await mongoPaper.save();
      console.log(`✅ Migrated paper: ${paper.title}`);

      // Migrate citations
      for (const citation of paper.citations) {
        const mongoCitation = new CitationModel({
          sourcePaperId: savedPaper._id,
          targetPaperId: citation.targetPaperId,
          citationType: citation.citationType || 'direct',
          context: citation.context || '',
          pageNumber: citation.pageNumber,
          metadata: {},
        });
        await mongoCitation.save();
      }

    } catch (error) {
      console.error(`❌ Failed to migrate paper ${paper.title}:`, error);
    }
  }
}

async function migrateNotes() {
  console.log('📝 Migrating notes...');
  
  const notes = await prisma.note.findMany({
    include: {
      annotations: true,
    },
  });

  console.log(`Found ${notes.length} notes to migrate`);

  for (const note of notes) {
    try {
      const mongoNote = new NoteModel({
        content: note.content,
        tags: note.tags,
        paperId: note.paperId,
        annotations: note.annotations.map(annotation => ({
          type: annotation.type,
          content: annotation.content,
          pageNumber: annotation.pageNumber,
          coordinates: annotation.position as any,
          metadata: {},
        })),
      });

      await mongoNote.save();
      console.log(`✅ Migrated note: ${note.content.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Failed to migrate note:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting PostgreSQL to MongoDB migration...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Migrate data
    await migratePapers();
    await migrateNotes();
    
    console.log('✅ Migration completed successfully!');
    
    // Verify migration
    const paperCount = await PaperModel.countDocuments();
    const noteCount = await NoteModel.countDocuments();
    
    console.log(`📊 Migration Summary:`);
    console.log(`   Papers: ${paperCount}`);
    console.log(`   Notes: ${noteCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

main(); 