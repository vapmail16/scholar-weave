import { INoteRepository, RepositoryError, EntityNotFoundError } from '../../../repository';
import { Note, CreateNoteInput, UpdateNoteInput } from '../../../index';
import { NoteModel, INoteDocument } from '../../models/mongodb/Note';

export class MongoNoteRepository implements INoteRepository {
  async create(data: CreateNoteInput): Promise<Note> {
    try {
      const noteDoc = new NoteModel({
        paperId: data.paperId || null,
        content: data.content,
        tags: data.tags || [],
        annotations: []
      });

      const savedNote = await noteDoc.save();
      return this.mapToNote(savedNote);
    } catch (error) {
      throw new RepositoryError('Failed to create note', 'CREATE_ERROR');
    }
  }

  async findById(id: string): Promise<Note | null> {
    try {
      const note = await NoteModel.findById(id);
      return note ? this.mapToNote(note) : null;
    } catch (error) {
      throw new RepositoryError('Failed to find note by ID', 'FIND_ERROR');
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Note[]> {
    try {
      const notes = await NoteModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError('Failed to find notes', 'FIND_ERROR');
    }
  }

  async update(id: string, data: UpdateNoteInput): Promise<Note | null> {
    try {
      const updateData: any = {};
      if (data.content !== undefined) updateData.content = data.content;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const note = await NoteModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return note ? this.mapToNote(note) : null;
    } catch (error) {
      throw new RepositoryError('Failed to update note', 'UPDATE_ERROR');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await NoteModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new RepositoryError('Failed to delete note', 'DELETE_ERROR');
    }
  }

  async count(): Promise<number> {
    try {
      return await NoteModel.countDocuments();
    } catch (error) {
      throw new RepositoryError('Failed to count notes', 'COUNT_ERROR');
    }
  }

  async findByPaperId(paperId: string): Promise<Note[]> {
    try {
      const notes = await NoteModel.find({ paperId }).sort({ createdAt: -1 });
      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError('Failed to find notes by paper ID', 'FIND_ERROR');
    }
  }

  async findByTag(tag: string): Promise<Note[]> {
    try {
      const notes = await NoteModel.find({
        tags: { $regex: tag, $options: 'i' }
      }).sort({ createdAt: -1 });
      
      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError('Failed to find notes by tag', 'FIND_ERROR');
    }
  }

  async findByContent(query: string): Promise<Note[]> {
    try {
      const notes = await NoteModel.find({
        $text: { $search: query }
      }).sort({ createdAt: -1 });
      
      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError('Failed to find notes by content', 'FIND_ERROR');
    }
  }

  async addAnnotation(noteId: string, annotation: any): Promise<Note> {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) {
        throw new EntityNotFoundError('Note', noteId);
      }

      note.annotations.push(annotation);
      const updatedNote = await note.save();
      return this.mapToNote(updatedNote);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw error;
      }
      throw new RepositoryError('Failed to add annotation', 'UPDATE_ERROR');
    }
  }

  async removeAnnotation(noteId: string, annotationId: string): Promise<Note> {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) {
        throw new EntityNotFoundError('Note', noteId);
      }

      note.annotations = note.annotations.filter(
        (ann: any) => ann._id.toString() !== annotationId
      );
      
      const updatedNote = await note.save();
      return this.mapToNote(updatedNote);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw error;
      }
      throw new RepositoryError('Failed to remove annotation', 'UPDATE_ERROR');
    }
  }

  async updateAnnotation(noteId: string, annotationId: string, annotation: any): Promise<Note> {
    try {
      const note = await NoteModel.findById(noteId);
      if (!note) {
        throw new EntityNotFoundError('Note', noteId);
      }

      const annotationIndex = note.annotations.findIndex(
        (ann: any) => ann._id.toString() === annotationId
      );

      if (annotationIndex === -1) {
        throw new EntityNotFoundError('Annotation', annotationId);
      }

      // Fix: Check if annotation exists and handle toObject properly
      const existingAnnotation = note.annotations[annotationIndex];
      if (!existingAnnotation) {
        throw new EntityNotFoundError('Annotation', annotationId);
      }

      note.annotations[annotationIndex] = {
        ...existingAnnotation,
        ...annotation
      };

      const updatedNote = await note.save();
      return this.mapToNote(updatedNote);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw error;
      }
      throw new RepositoryError('Failed to update annotation', 'UPDATE_ERROR');
    }
  }

  async getNotesWithAnnotations(paperId: string): Promise<Note[]> {
    try {
      const notes = await NoteModel.find({
        paperId,
        'annotations.0': { $exists: true }
      }).sort({ createdAt: -1 });
      
      return notes.map(note => this.mapToNote(note));
    } catch (error) {
      throw new RepositoryError('Failed to get notes with annotations', 'FIND_ERROR');
    }
  }

  private mapToNote(doc: INoteDocument): Note {
    return {
      id: (doc._id as any).toString(),
      paperId: doc.paperId || undefined,
      content: doc.content,
      tags: doc.tags,
      annotations: doc.annotations.map((ann: any) => ({
        id: (ann._id as any).toString(),
        type: ann.type,
        pageNumber: ann.pageNumber,
        position: ann.position,
        content: ann.content,
        color: ann.color
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }
} 