import { PrismaClient } from '@prisma/client';

import { databaseConnection } from '../../database';
import { mongodbConnection } from '../../mongodb';
import { IRepositoryFactory, IPaperRepository, INoteRepository, ICitationRepository } from '../../repository';
import { PostgresPaperRepository } from './postgres/PaperRepository';
import { PostgresNoteRepository } from './postgres/NoteRepository';
import { MongoPaperRepository } from './mongodb/PaperRepository';
import { MongoNoteRepository } from './mongodb/NoteRepository';

export class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory;
  private paperRepository: IPaperRepository | null = null;
  private noteRepository: INoteRepository | null = null;
  private citationRepository: ICitationRepository | null = null;
  private prisma: PrismaClient | null = null;
  private databaseType: 'mongodb' | 'postgres' | 'hybrid' = 'hybrid';

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  async initialize(): Promise<void> {
    const dbType = process.env['DATABASE_TYPE'] || 'hybrid';
    this.databaseType = dbType as 'mongodb' | 'postgres' | 'hybrid';

    if (this.databaseType === 'postgres') {
      await this.initializePostgres();
    } else if (this.databaseType === 'mongodb') {
      await this.initializeMongoDB();
    } else {
      // Hybrid mode: PostgreSQL for papers, MongoDB for notes
      await this.initializeHybrid();
    }
  }

  private async initializePostgres(): Promise<void> {
    await databaseConnection.connect();
    this.prisma = new PrismaClient();
    this.paperRepository = new PostgresPaperRepository(this.prisma);
    this.noteRepository = new PostgresNoteRepository(this.prisma);
  }

  private async initializeMongoDB(): Promise<void> {
    await mongodbConnection.connect();
    this.paperRepository = new MongoPaperRepository();
    this.noteRepository = new MongoNoteRepository();
    // TODO: Implement MongoCitationRepository
  }

  private async initializeHybrid(): Promise<void> {
    // Connect to both databases
    await databaseConnection.connect();
    await mongodbConnection.connect();
    
    this.prisma = new PrismaClient();
    this.paperRepository = new PostgresPaperRepository(this.prisma);
    this.noteRepository = new MongoNoteRepository();
    
    console.log('🔄 Using hybrid mode: PostgreSQL for papers, MongoDB for notes');
  }

  getPaperRepository(): IPaperRepository {
    if (!this.paperRepository) {
      throw new Error('Repository factory not initialized');
    }
    return this.paperRepository;
  }

  getNoteRepository(): INoteRepository {
    if (!this.noteRepository) {
      throw new Error('Repository factory not initialized');
    }
    return this.noteRepository;
  }

  getCitationRepository(): ICitationRepository {
    if (!this.citationRepository) {
      throw new Error('Citation repository not implemented');
    }
    return this.citationRepository;
  }

  getDatabaseType(): 'mongodb' | 'postgres' | 'hybrid' {
    return this.databaseType;
  }

  async cleanup(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    if (this.databaseType === 'postgres' || this.databaseType === 'hybrid') {
      await databaseConnection.disconnect();
    }
    if (this.databaseType === 'mongodb' || this.databaseType === 'hybrid') {
      await mongodbConnection.disconnect();
    }
  }
} 