import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholar_weave';

// Prisma client
const prisma = new PrismaClient();

// MongoDB models (we'll define them inline for simplicity)
interface MongoPaper {
  _id: any;
  title: string;
  abstract: string;
  keywords: string[];
  publicationDate: Date;
  journal?: string;
  conference?: string;
  doi?: string;
  url?: string;
  filePath?: string;
  authors: Array<{
    name: string;
    affiliation?: string;
    email?: string;
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface MongoNote {
  _id: any;
  paperId: string;
  content: string;
  tags: string[];
  annotations: Array<{
    _id: any;
    type: string;
    pageNumber: number;
    position: any;
    content: string;
    color?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateToPostgres() {
  try {
    console.log('🔄 Starting migration from MongoDB to PostgreSQL...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Get MongoDB collections
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB database connection failed');
    }

    const mongoPapers = await db.collection('papers').find({}).toArray() as MongoPaper[];
    const mongoNotes = await db.collection('notes').find({}).toArray() as MongoNote[];

    console.log(`📊 Found ${mongoPapers.length} papers and ${mongoNotes.length} notes in MongoDB`);

    // Migrate papers
    console.log('📚 Migrating papers...');
    for (const mongoPaper of mongoPapers) {
      try {
        // Create authors first
        const authors: any[] = [];
        for (const author of mongoPaper.authors || []) {
          const createdAuthor = await prisma.author.create({
            data: {
              name: author.name,
              affiliation: author.affiliation || null,
              email: author.email || null,
            },
          });
          authors.push(createdAuthor);
        }

        // Create paper
        const paper = await prisma.paper.create({
          data: {
            title: mongoPaper.title,
            abstract: mongoPaper.abstract,
            keywords: mongoPaper.keywords,
            publicationDate: mongoPaper.publicationDate,
            journal: mongoPaper.journal || null,
            conference: mongoPaper.conference || null,
            doi: mongoPaper.doi || null,
            url: mongoPaper.url || null,
            filePath: mongoPaper.filePath || null,
            metadata: mongoPaper.metadata || {},
          },
        });

        // Create paper-author relationships
        for (let i = 0; i < authors.length; i++) {
          await prisma.paperAuthor.create({
            data: {
              paperId: paper.id,
              authorId: authors[i].id,
              order: i,
            },
          });
        }

        console.log(`✅ Migrated paper: ${paper.title}`);
      } catch (error) {
        console.error(`❌ Failed to migrate paper ${mongoPaper.title}:`, error);
      }
    }

    // Migrate notes
    console.log('📝 Migrating notes...');
    for (const mongoNote of mongoNotes) {
      try {
        // Find the corresponding paper
        const paper = await prisma.paper.findFirst({
          where: {
            OR: [
              { id: mongoNote.paperId },
              { title: { contains: mongoNote.paperId } }, // Fallback if paperId is actually a title
            ],
          },
        });

        if (!paper) {
          console.warn(`⚠️  Paper not found for note, creating standalone note`);
        }

        // Create note
        const noteData: any = {
          content: mongoNote.content,
          tags: mongoNote.tags,
        };
        
        if (paper?.id) {
          noteData.paperId = paper.id;
        }

        const note = await prisma.note.create({
          data: noteData,
        });

        // Create annotations
        for (const annotation of mongoNote.annotations || []) {
          await prisma.annotation.create({
            data: {
              noteId: note.id,
              type: annotation.type.toUpperCase() as any, // Convert to Prisma enum
              pageNumber: annotation.pageNumber,
              position: annotation.position,
              content: annotation.content,
              color: annotation.color || null,
            },
          });
        }

        console.log(`✅ Migrated note: ${note.content.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Failed to migrate note:`, error);
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Verify migration
    const postgresPapers = await prisma.paper.count();
    const postgresNotes = await prisma.note.count();
    const postgresAuthors = await prisma.author.count();

    console.log('\n📊 Migration Summary:');
    console.log(`Papers: ${mongoPapers.length} → ${postgresPapers}`);
    console.log(`Notes: ${mongoNotes.length} → ${postgresNotes}`);
    console.log(`Authors: ${postgresAuthors} (created)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Cleanup
    await mongoose.disconnect();
    await prisma.$disconnect();
    console.log('🔌 Disconnected from databases');
  }
}

// Run migration
if (require.main === module) {
  migrateToPostgres()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateToPostgres }; 