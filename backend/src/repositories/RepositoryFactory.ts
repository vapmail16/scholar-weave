import { IPaperRepository, INoteRepository, ICitationRepository, IRepositoryFactory } from '@/interfaces/repository';
import { PostgresPaperRepository } from './postgres/PaperRepository';
import { PostgresNoteRepository } from './postgres/NoteRepository';
import { databaseConnection } from '@/config/database';

export class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory;
  private paperRepository: IPaperRepository | null = null;
  private noteRepository: INoteRepository | null = null;
  private citationRepository: ICitationRepository | null = null;

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  async initialize(): Promise<void> {
    // Ensure database connection is established
    if (!databaseConnection.isConnectedToDatabase()) {
      await databaseConnection.connect();
    }
  }

  getPaperRepository(): IPaperRepository {
    if (!this.paperRepository) {
      const prisma = databaseConnection.getPrismaClient();
      this.paperRepository = new PostgresPaperRepository(prisma);
    }
    return this.paperRepository;
  }

  getNoteRepository(): INoteRepository {
    if (!this.noteRepository) {
      const prisma = databaseConnection.getPrismaClient();
      this.noteRepository = new PostgresNoteRepository(prisma);
    }
    return this.noteRepository;
  }

  getCitationRepository(): ICitationRepository {
    if (!this.citationRepository) {
      // TODO: Implement PostgresCitationRepository
      throw new Error('CitationRepository not implemented yet');
    }
    return this.citationRepository;
  }

  async close(): Promise<void> {
    await databaseConnection.disconnect();
  }
}

// Export singleton instance
export const repositoryFactory = RepositoryFactory.getInstance(); 