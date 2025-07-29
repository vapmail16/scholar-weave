import { apiClient } from './api-client';
import type {
  Paper,
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  ImportSource,
  ExportFormat,
} from '../types/api';

export class PapersApiService {
  private basePath = '/api/papers';

  // Get papers with filtering and pagination
  async getPapers(params?: SearchParams): Promise<PaginatedResponse<Paper>> {
    return apiClient.get<PaginatedResponse<Paper>>(`${this.basePath}`, params);
  }

  // Get specific paper by ID
  async getPaper(id: string): Promise<ApiResponse<Paper>> {
    return apiClient.get<ApiResponse<Paper>>(`${this.basePath}/${id}`);
  }

  // Create new paper
  async createPaper(paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Paper>> {
    return apiClient.post<ApiResponse<Paper>>(`${this.basePath}`, paper);
  }

  // Update paper
  async updatePaper(id: string, updates: Partial<Paper>): Promise<ApiResponse<Paper>> {
    return apiClient.put<ApiResponse<Paper>>(`${this.basePath}/${id}`, updates);
  }

  // Delete paper
  async deletePaper(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  // Search papers
  async searchPapers(params: SearchParams): Promise<PaginatedResponse<Paper>> {
    return apiClient.get<PaginatedResponse<Paper>>(`${this.basePath}/search`, params);
  }

  // Import paper from external source
  async importPaper(source: ImportSource): Promise<ApiResponse<Paper>> {
    if (source.type === 'file' && source.value instanceof File) {
      return apiClient.uploadFile<ApiResponse<Paper>>(
        `${this.basePath}/import/file`,
        source.value,
        { metadata: source.metadata }
      );
    } else {
      return apiClient.post<ApiResponse<Paper>>(`${this.basePath}/import`, {
        type: source.type,
        value: source.value,
        metadata: source.metadata,
      });
    }
  }

  // Export papers
  async exportPapers(paperIds: string[], format: ExportFormat): Promise<Blob> {
    const response = await fetch(`${apiClient['baseUrl']}${this.basePath}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiClient['defaultHeaders'],
      },
      body: JSON.stringify({
        paperIds,
        format,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Get paper file content (PDF)
  async getPaperFile(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseUrl']}${this.basePath}/${id}/file`, {
      headers: apiClient['defaultHeaders'],
    });

    if (!response.ok) {
      throw new Error(`Failed to get paper file: ${response.statusText}`);
    }

    return response.blob();
  }

  // Upload paper file
  async uploadPaperFile(id: string, file: File): Promise<ApiResponse<Paper>> {
    return apiClient.uploadFile<ApiResponse<Paper>>(`${this.basePath}/${id}/file`, file);
  }

  // Get related papers
  async getRelatedPapers(id: string, limit?: number): Promise<ApiResponse<Paper[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return apiClient.get<ApiResponse<Paper[]>>(`${this.basePath}/${id}/related`, params);
  }

  // Bulk operations
  async bulkUpdatePapers(updates: Array<{ id: string; data: Partial<Paper> }>): Promise<ApiResponse<Paper[]>> {
    return apiClient.post<ApiResponse<Paper[]>>(`${this.basePath}/bulk/update`, { updates });
  }

  async bulkDeletePapers(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`${this.basePath}/bulk/delete`, { ids });
  }

  async bulkTagPapers(ids: string[], tags: string[]): Promise<ApiResponse<Paper[]>> {
    return apiClient.post<ApiResponse<Paper[]>>(`${this.basePath}/bulk/tag`, { ids, tags });
  }
}

// Create singleton instance
export const papersApi = new PapersApiService();