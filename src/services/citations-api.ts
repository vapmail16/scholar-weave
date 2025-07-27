import { apiClient } from './api-client';
import type {
  Citation,
  ApiResponse,
  PaginatedResponse,
  CitationGraph,
} from '../types/api';

export class CitationsApiService {
  private basePath = '/api/citations';

  // Get citations for a specific paper
  async getCitations(paperId: string): Promise<ApiResponse<Citation[]>> {
    return apiClient.get<ApiResponse<Citation[]>>(`${this.basePath}/${paperId}`);
  }

  // Get citation graph for a paper
  async getCitationGraph(
    paperId: string,
    depth?: number,
    direction?: 'in' | 'out' | 'both'
  ): Promise<ApiResponse<CitationGraph>> {
    const params: Record<string, string> = {};
    if (depth !== undefined) params.depth = depth.toString();
    if (direction) params.direction = direction;

    return apiClient.get<ApiResponse<CitationGraph>>(
      `/api/citation-graph/${paperId}`,
      params
    );
  }

  // Format citations in a specific style
  async formatCitations(
    paperIds: string[],
    style: 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard' | 'vancouver'
  ): Promise<ApiResponse<{ paperId: string; citation: string }[]>> {
    return apiClient.post<ApiResponse<{ paperId: string; citation: string }[]>>(
      '/api/citations/format',
      { paperIds, style }
    );
  }

  // Create new citation
  async createCitation(citation: Omit<Citation, 'id' | 'createdAt'>): Promise<ApiResponse<Citation>> {
    return apiClient.post<ApiResponse<Citation>>(`${this.basePath}`, citation);
  }

  // Update citation
  async updateCitation(id: string, updates: Partial<Citation>): Promise<ApiResponse<Citation>> {
    return apiClient.put<ApiResponse<Citation>>(`${this.basePath}/${id}`, updates);
  }

  // Delete citation
  async deleteCitation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
  }

  // Get papers that cite a specific paper (forward citations)
  async getForwardCitations(paperId: string): Promise<ApiResponse<Citation[]>> {
    return apiClient.get<ApiResponse<Citation[]>>(`${this.basePath}/${paperId}/forward`);
  }

  // Get papers cited by a specific paper (backward citations)
  async getBackwardCitations(paperId: string): Promise<ApiResponse<Citation[]>> {
    return apiClient.get<ApiResponse<Citation[]>>(`${this.basePath}/${paperId}/backward`);
  }

  // Get citation metrics for a paper
  async getCitationMetrics(paperId: string): Promise<ApiResponse<{
    totalCitations: number;
    h_index: number;
    citationsPerYear: Array<{ year: number; count: number }>;
    topCitingPapers: Array<{ paperId: string; title: string; citationCount: number }>;
  }>> {
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/${paperId}/metrics`);
  }

  // Search citations by context or type
  async searchCitations(query: {
    paperId?: string;
    context?: string;
    citationType?: Citation['citationType'];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Citation>> {
    return apiClient.get<PaginatedResponse<Citation>>(`${this.basePath}/search`, query);
  }

  // Bulk create citations
  async bulkCreateCitations(citations: Array<Omit<Citation, 'id' | 'createdAt'>>): Promise<ApiResponse<Citation[]>> {
    return apiClient.post<ApiResponse<Citation[]>>(`${this.basePath}/bulk`, { citations });
  }

  // Get citation path between two papers
  async getCitationPath(
    fromPaperId: string,
    toPaperId: string,
    maxDepth?: number
  ): Promise<ApiResponse<{
    path: Citation[];
    distance: number;
    found: boolean;
  }>> {
    const params: Record<string, string> = {
      from: fromPaperId,
      to: toPaperId,
    };
    if (maxDepth !== undefined) params.maxDepth = maxDepth.toString();

    return apiClient.get<ApiResponse<any>>(`${this.basePath}/path`, params);
  }
}

// Create singleton instance
export const citationsApi = new CitationsApiService();