import { PrismaClient } from '@prisma/client';
import { INoteRepository, RepositoryError, EntityNotFoundError } from '@/interfaces/repository';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types';

export class PostgresNoteRepository implements INoteRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateNoteInput): Promise<Note> {
    try {
      // If no paperId is provided, we need to either:
      // 1. Create a default paper, or
      // 2. Make paperId optional in the schema
      // For now, let's create a default paper if none is provided
      let paperId = data.paperId;
      
      if (!paperId) {
        // Create a default paper for standalone notes
        const defaultPaper = await this.prisma.paper.create({
          data: {
            title: "Standalone Notes",
            abstract: "Collection of standalone research notes",
            keywords: ["notes", "standalone"],
            publicationDate: new Date(),
            journal: "Personal Notes"
          }
        });
        paperId = defaultPaper.id;
      }

      const note = await this.prisma.note.create({
        data: {
          content: data.content,
          tags: data.tags || [],
          paperId: paperId,
          annotations: {
            create: data.annotations || []
          }
        },
        include: {
          annotations: true
        }
      });

      return {
        id: note.id,
        content: note.content,
        tags: note.tags as string[],
        paperId: note.paperId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        annotations: note.annotations
      };
    } catch (error) {
      throw new RepositoryError(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Note | null> {
    try {
      const note = await this.prisma.note.findUnique({
        where: { id },
        include: {
          annotations: true
        }
      });

      if (!note) {
        return null;
      }

      return {
        id: note.id,
        content: note.content,
        tags: note.tags as string[],
        paperId: note.paperId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        annotations: note.annotations
      };
    } catch (error) {
      throw new RepositoryError(`Failed to find note by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
        include: {
          annotations: true
        }
      });

      return notes.map(note => ({
        id: note.id,
        content: note.content,
        tags: note.tags as string[],
        paperId: note.paperId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        annotations: note.annotations
      }));
    } catch (error) {
      throw new RepositoryError(`Failed to find notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, data: UpdateNoteInput): Promise<Note | null> {
    try {
      const note = await this.prisma.note.update({
        where: { id },
        data: {
          content: data.content,
          tags: data.tags,
          paperId: data.paperId,
          updatedAt: new Date()
        },
        include: {
          annotations: true
        }
      });

      return {
        id: note.id,
        content: note.content,
        tags: note.tags as string[],
        paperId: note.paperId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        annotations: note.annotations
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new EntityNotFoundError(`Note with ID ${id} not found`);
      }
      throw new RepositoryError(`Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.note.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw new RepositoryError(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.note.count();
    } catch (error) {
      throw new RepositoryError(`Failed to count notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 