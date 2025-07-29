import { 
  Paper, 
  Note, 
  Citation, 
  CreatePaperInput, 
  UpdatePaperInput, 
  CreateNoteInput, 
  UpdateNoteInput, 
  CreateCitationInput,
  SearchParams,
  PaginatedResponse 
} from './index';

// Base repository interface with common CRUD operations
export interface IBaseRepository<T, CreateInput, UpdateInput> {
  create(data: CreateInput): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(limit?: number, offset?: number): Promise<T[]>;
  update(id: string, data: UpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

// Paper repository interface
export interface IPaperRepository extends IBaseRepository<Paper, CreatePaperInput, UpdatePaperInput> {
  search(params: SearchParams): Promise<PaginatedResponse<Paper>>;
  findByDoi(doi: string): Promise<Paper | null>;
  findByAuthor(authorName: string): Promise<Paper[]>;
  findByKeyword(keyword: string): Promise<Paper[]>;
  findByJournal(journal: string): Promise<Paper[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Paper[]>;
  getCitations(paperId: string): Promise<Citation[]>;
  getCitedBy(paperId: string): Promise<Paper[]>;
  addCitation(sourcePaperId: string, targetPaperId: string): Promise<void>;
  removeCitation(sourcePaperId: string, targetPaperId: string): Promise<void>;
  getCitationCount(paperId: string): Promise<number>;
  getCitationNetwork(paperId: string, depth?: number): Promise<Paper[]>;
}

// Note repository interface
export interface INoteRepository extends IBaseRepository<Note, CreateNoteInput, UpdateNoteInput> {
  findByPaperId(paperId: string): Promise<Note[]>;
  findByTag(tag: string): Promise<Note[]>;
  findByContent(query: string): Promise<Note[]>;
  addAnnotation(noteId: string, annotation: any): Promise<Note>;
  removeAnnotation(noteId: string, annotationId: string): Promise<Note>;
  updateAnnotation(noteId: string, annotationId: string, annotation: any): Promise<Note>;
  getNotesWithAnnotations(paperId: string): Promise<Note[]>;
}

// Citation repository interface
export interface ICitationRepository extends IBaseRepository<Citation, CreateCitationInput, Partial<CreateCitationInput>> {
  findBySourcePaper(sourcePaperId: string): Promise<Citation[]>;
  findByTargetPaper(targetPaperId: string): Promise<Citation[]>;
  findByPaperPair(sourcePaperId: string, targetPaperId: string): Promise<Citation | null>;
  getCitationGraph(paperId: string, depth?: number): Promise<{ nodes: any[], edges: any[] }>;
  getCitationPath(sourcePaperId: string, targetPaperId: string): Promise<Citation[]>;
  getCitationStatistics(paperId: string): Promise<{
    incoming: number;
    outgoing: number;
    total: number;
  }>;
}

// Repository factory interface
export interface IRepositoryFactory {
  getPaperRepository(): IPaperRepository;
  getNoteRepository(): INoteRepository;
  getCitationRepository(): ICitationRepository;
}

// Database connection interface
export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnection(): any;
}

// Repository error types
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class EntityNotFoundError extends RepositoryError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 'ENTITY_NOT_FOUND', 404);
    this.name = 'EntityNotFoundError';
  }
}

export class DuplicateEntityError extends RepositoryError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} ${value} already exists`, 'DUPLICATE_ENTITY', 409);
    this.name = 'DuplicateEntityError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, _field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
} 