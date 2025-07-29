// Core data models for the research platform
export interface Author {
  id?: string;
  name: string;
  affiliation?: string;
  email?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  keywords: string[];
  publicationDate: string;
  journal?: string;
  conference?: string;
  doi?: string;
  url?: string;
  filePath?: string;
  citations: string[]; // Array of paper IDs
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  id: string;
  sourcePaperId: string;
  targetPaperId: string;
  context: string;
  citationType: 'direct' | 'indirect' | 'supportive' | 'critical' | 'background';
  pageNumber?: number;
  createdAt: string;
}

export interface Note {
  id: string;
  paperId: string;
  content: string;
  tags: string[];
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'bookmark';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content: string;
  color?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  status: 'success' | 'error';
}

// Search and filter types
export interface SearchParams {
  query?: string;
  authors?: string[];
  keywords?: string[];
  dateFrom?: string;
  dateTo?: string;
  journal?: string;
  conference?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title' | 'relevance' | 'citations';
  sortOrder?: 'asc' | 'desc';
}

export interface CitationGraphNode {
  id: string;
  paperId: string;
  title: string;
  authors: string[];
  citationCount: number;
  year: number;
}

export interface CitationGraphEdge {
  source: string;
  target: string;
  type: Citation['citationType'];
  weight: number;
}

export interface CitationGraph {
  nodes: CitationGraphNode[];
  edges: CitationGraphEdge[];
  centerNodeId: string;
}

// Export and import types
export interface ExportFormat {
  type: 'bibtex' | 'endnote' | 'ris' | 'csv' | 'json';
  options?: Record<string, any>;
}

export interface ImportSource {
  type: 'doi' | 'url' | 'file' | 'arxiv' | 'pubmed';
  value: string | File;
  metadata?: Partial<Paper>;
}