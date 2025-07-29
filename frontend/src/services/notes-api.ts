import { apiClient } from './api-client';
import type {
  Note,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

export class NotesApiService {
  private basePath = '/api/notes';

  // Get notes with filtering
  async getNotes(params?: {
    paperId?: string;
    tags?: string[];
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Note>> {
    return apiClient.get<PaginatedResponse<Note>>(`${this.basePath}`, params);
  }

  // Get specific note by ID
  async getNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.get<ApiResponse<Note>>(`${this.basePath}/${id}`);
  }

  // Create new note
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Note>> {
    return apiClient.post<ApiResponse<Note>>(`${this.basePath}`, note);
  }

  // Update note
  async updateNote(id: string, updates: Partial<Note>): Promise<ApiResponse<Note>> {
    return apiClient.put<ApiResponse<Note>>(`${this.basePath}/${id}`, updates);
  }

  // Delete note
  async deleteNote(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  // Get all notes for a specific paper
  async getNotesByPaper(paperId: string): Promise<ApiResponse<Note[]>> {
    return apiClient.get<ApiResponse<Note[]>>(`${this.basePath}/paper/${paperId}`);
  }

  // Search notes by content or tags
  async searchNotes(query: {
    text?: string;
    tags?: string[];
    paperId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Note>> {
    return apiClient.get<PaginatedResponse<Note>>(`${this.basePath}/search`, query);
  }

  // Get all unique tags
  async getTags(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(`${this.basePath}/tags`);
  }

  // Bulk operations
  async bulkUpdateNotes(updates: Array<{ id: string; data: Partial<Note> }>): Promise<ApiResponse<Note[]>> {
    return apiClient.post<ApiResponse<Note[]>>(`${this.basePath}/bulk/update`, { updates });
  }

  async bulkDeleteNotes(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.basePath}/bulk/delete`, { ids });
  }

  async bulkTagNotes(ids: string[], tags: string[]): Promise<ApiResponse<Note[]>> {
    return apiClient.post<ApiResponse<Note[]>>(`${this.basePath}/bulk/tag`, { ids, tags });
  }

  // Export notes
  async exportNotes(
    noteIds: string[],
    format: 'markdown' | 'pdf' | 'docx' | 'html' | 'json'
  ): Promise<Blob> {
    const response = await fetch(`${apiClient['baseUrl']}${this.basePath}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiClient['defaultHeaders'],
      },
      body: JSON.stringify({
        noteIds,
        format,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Get notes with cross-references
  async getCrossReferences(noteId: string): Promise<ApiResponse<{
    referencedBy: Note[];
    references: Note[];
  }>> {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/${noteId}/cross-references`);
  }

  // Link notes together
  async linkNotes(fromNoteId: string, toNoteId: string, relationship?: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.basePath}/${fromNoteId}/link`, {
      targetNoteId: toNoteId,
      relationship,
    });
  }

  // Unlink notes
  async unlinkNotes(fromNoteId: string, toNoteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${fromNoteId}/link/${toNoteId}`);
  }
}

// Create singleton instance
export const notesApi = new NotesApiService();