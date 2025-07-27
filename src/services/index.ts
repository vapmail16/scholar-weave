// Export all API services and types for easy importing
export { ApiClient, apiClient, ApiError } from './api-client';
export { PapersApiService, papersApi } from './papers-api';
export { CitationsApiService, citationsApi } from './citations-api';
export { NotesApiService, notesApi } from './notes-api';

// Re-export all types
export * from '../types/api';

// Import classes for type definitions
import { PapersApiService } from './papers-api';
import { CitationsApiService } from './citations-api';
import { NotesApiService } from './notes-api';
import { papersApi } from './papers-api';
import { citationsApi } from './citations-api';
import { notesApi } from './notes-api';

// Create a combined API interface for convenience
export interface ScholarWeaveApi {
  papers: PapersApiService;
  citations: CitationsApiService;
  notes: NotesApiService;
}

// Combined API instance
export const api: ScholarWeaveApi = {
  papers: papersApi,
  citations: citationsApi,
  notes: notesApi,
};