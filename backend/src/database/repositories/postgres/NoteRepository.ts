import { PrismaClient } from '@prisma/client';
import { INoteRepository, RepositoryError, EntityNotFoundError } from '../../../repository';
import { Note, CreateNoteInput, UpdateNoteInput, Annotation } from '../../../index';

export class PostgresNoteRepository implements INoteRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateNoteInput): Promise<Note> {
    try {
      const note = await this.prisma.note.create({
        data: {
          content: data.content,
          tags: data.tags || [],
          paperId: data.paperId || undefined,
          annotations: {
            create: data.annotations?.map(ann => ({
              type: ann.type.toUpperCase() as any,
              pageNumber: ann.pageNumber,
              position: ann.position,
              content: ann.content,
              color: ann.color
            })) || []
          }
        },
        include: {
          annotations: true
        }
      });

      return this.mapToNote(note);
    } catch (error) {
      throw new RepositoryError(
        `Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_ERROR',
        500
      );
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

      if (!note) return null;

      return this.mapToNote(note);
    } catch (error) {
      throw new RepositoryError(
        `Failed to find note by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        skip: offset,
        take: limit,
        include: {
          annotations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find notes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  async update(id: string, data: UpdateNoteInput): Promise<Note | null> {
    try {
      const note = await this.prisma.note.update({
        where: { id },
        data: {
          content: data.content,
          tags: data.tags,
          annotations: {
            deleteMany: {},
            create: data.annotations?.map(ann => ({
              type: ann.type.toUpperCase() as any,
              pageNumber: ann.pageNumber,
              position: ann.position,
              content: ann.content,
              color: ann.color
            })) || []
          }
        },
        include: {
          annotations: true
        }
      });

      return this.mapToNote(note);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return null;
      }
      throw new RepositoryError(
        `Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR',
        500
      );
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
      throw new RepositoryError(
        `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_ERROR',
        500
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.note.count();
    } catch (error) {
      throw new RepositoryError(
        `Failed to count notes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COUNT_ERROR',
        500
      );
    }
  }

  async findByPaperId(paperId: string): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        where: { paperId },
        include: {
          annotations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find notes by paper ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  async findByTag(tag: string): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        where: {
          tags: {
            has: tag
          }
        },
        include: {
          annotations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find notes by tag: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  async findByContent(query: string): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        where: {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        },
        include: {
          annotations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find notes by content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  async addAnnotation(noteId: string, annotation: Omit<Annotation, 'id'>): Promise<Note> {
    try {
      const note = await this.prisma.note.update({
        where: { id: noteId },
        data: {
          annotations: {
            create: {
              type: annotation.type.toUpperCase() as any,
              pageNumber: annotation.pageNumber,
              position: annotation.position,
              content: annotation.content,
              color: annotation.color
            }
          }
        },
        include: {
          annotations: true
        }
      });

      return this.mapToNote(note);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new EntityNotFoundError('Note', noteId);
      }
      throw new RepositoryError(
        `Failed to add annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR',
        500
      );
    }
  }

  async removeAnnotation(noteId: string, annotationId: string): Promise<Note> {
    try {
      const note = await this.prisma.note.update({
        where: { id: noteId },
        data: {
          annotations: {
            delete: {
              id: annotationId
            }
          }
        },
        include: {
          annotations: true
        }
      });

      return this.mapToNote(note);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new EntityNotFoundError('Note', noteId);
      }
      throw new RepositoryError(
        `Failed to remove annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR',
        500
      );
    }
  }

  async updateAnnotation(noteId: string, annotationId: string, annotation: Partial<Omit<Annotation, 'id'>>): Promise<Note> {
    try {
      // First check if the annotation exists
      const existingAnnotation = await this.prisma.annotation.findUnique({
        where: { id: annotationId }
      });

      if (!existingAnnotation) {
        throw new EntityNotFoundError('Annotation', annotationId);
      }

      // Update the annotation
      await this.prisma.annotation.update({
        where: { id: annotationId },
        data: {
          type: annotation.type?.toUpperCase() as any,
          pageNumber: annotation.pageNumber,
          position: annotation.position,
          content: annotation.content,
          color: annotation.color
        }
      });

      // Get the updated note
      const note = await this.prisma.note.findUnique({
        where: { id: noteId },
        include: {
          annotations: true
        }
      });

      if (!note) {
        throw new EntityNotFoundError('Note', noteId);
      }

      return this.mapToNote(note);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw error;
      }
      throw new RepositoryError(
        `Failed to update annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR',
        500
      );
    }
  }

  async getNotesWithAnnotations(paperId: string): Promise<Note[]> {
    try {
      const notes = await this.prisma.note.findMany({
        where: {
          paperId,
          annotations: {
            some: {}
          }
        },
        include: {
          annotations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError(
        `Failed to get notes with annotations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FIND_ERROR',
        500
      );
    }
  }

  private mapToNote(note: any): Note {
    return {
      id: note.id,
      paperId: note.paperId,
      content: note.content,
      tags: note.tags,
      annotations: note.annotations.map((ann: any) => ({
        id: ann.id,
        type: ann.type.toLowerCase() as 'highlight' | 'comment' | 'bookmark',
        pageNumber: ann.pageNumber,
        position: ann.position as { x: number; y: number; width?: number; height?: number },
        content: ann.content,
        color: ann.color
      })),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    };
  }
}