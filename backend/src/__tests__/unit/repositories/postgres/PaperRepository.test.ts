import { IPaperRepository } from '@/interfaces/repository';
import { CreatePaperInput, UpdatePaperInput, Paper, SearchParams, PaginatedResponse } from '@/types';
import { mockCreatePaperInput, mockUpdatePaperInput } from '@/__tests__/fixtures/paper.fixtures';

// Mock repository implementation for testing
class MockPaperRepository implements IPaperRepository {
  private papers: Paper[] = [];

  async create(data: CreatePaperInput): Promise<Paper> {
    const paper: Paper = {
      id: `paper-${Date.now()}`,
      title: data.title,
      authors: data.authors.map((author, index) => ({ id: `author-${index}`, ...author })),
      abstract: data.abstract,
      keywords: data.keywords,
      publicationDate: data.publicationDate,
      journal: data.journal,
      conference: data.conference,
      doi: data.doi,
      url: data.url,
      filePath: data.filePath,
      citations: [],
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.papers.push(paper);
    return paper;
  }

  async findById(id: string): Promise<Paper | null> {
    return this.papers.find(paper => paper.id === id) || null;
  }

  async findAll(limit?: number, offset?: number): Promise<Paper[]> {
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return this.papers.slice(start, end);
  }

  async update(id: string, data: UpdatePaperInput): Promise<Paper | null> {
    const index = this.papers.findIndex(paper => paper.id === id);
    if (index === -1) return null;
    
    const updatedPaper = {
      ...this.papers[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.papers[index] = updatedPaper;
    return updatedPaper;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.papers.findIndex(paper => paper.id === id);
    if (index === -1) return false;
    this.papers.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.papers.length;
  }

  async search(params: SearchParams): Promise<PaginatedResponse<Paper>> {
    let filteredPapers = [...this.papers];
    
    if (params.query) {
      filteredPapers = filteredPapers.filter(paper => 
        paper.title.toLowerCase().includes(params.query!.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(params.query!.toLowerCase())
      );
    }

    const total = filteredPapers.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filteredPapers.slice(start, end);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      status: 'success'
    };
  }

  async findByDoi(doi: string): Promise<Paper | null> {
    return this.papers.find(paper => paper.doi === doi) || null;
  }

  async findByAuthor(authorName: string): Promise<Paper[]> {
    return this.papers.filter(paper => 
      paper.authors.some(author => 
        author.name.toLowerCase().includes(authorName.toLowerCase())
      )
    );
  }

  async findByKeyword(keyword: string): Promise<Paper[]> {
    return this.papers.filter(paper => 
      paper.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  async findByJournal(journal: string): Promise<Paper[]> {
    return this.papers.filter(paper => 
      paper.journal?.toLowerCase().includes(journal.toLowerCase())
    );
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Paper[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.papers.filter(paper => {
      const pubDate = new Date(paper.publicationDate);
      return pubDate >= start && pubDate <= end;
    });
  }

  async getCitations(_paperId: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  async getCitedBy(_paperId: string): Promise<Paper[]> {
    // Mock implementation
    return [];
  }

  async addCitation(_sourcePaperId: string, _targetPaperId: string): Promise<void> {
    // Mock implementation
  }

  async removeCitation(_sourcePaperId: string, _targetPaperId: string): Promise<void> {
    // Mock implementation
  }

  async getCitationCount(_paperId: string): Promise<number> {
    return 0;
  }

  async getCitationNetwork(_paperId: string, _depth?: number): Promise<Paper[]> {
    return [];
  }
}

describe('PaperRepository', () => {
  let repository: IPaperRepository;

  beforeEach(() => {
    repository = new MockPaperRepository();
  });

  describe('create', () => {
    it('should create a new paper', async () => {
      const result = await repository.create(mockCreatePaperInput);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(mockCreatePaperInput.title);
      expect(result.authors).toHaveLength(mockCreatePaperInput.authors.length);
      expect(result.abstract).toBe(mockCreatePaperInput.abstract);
      expect(result.keywords).toEqual(mockCreatePaperInput.keywords);
    });

    it('should generate unique IDs for papers', async () => {
      const paper1 = await repository.create(mockCreatePaperInput);
      const paper2 = await repository.create(mockCreatePaperInput);
      
      expect(paper1.id).not.toBe(paper2.id);
    });
  });

  describe('findById', () => {
    it('should find a paper by ID', async () => {
      const created = await repository.create(mockCreatePaperInput);
      const found = await repository.findById(created.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe(created.title);
    });

    it('should return null for non-existent paper', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all papers', async () => {
      await repository.create(mockCreatePaperInput);
      await repository.create(mockCreatePaperInput);
      
      const papers = await repository.findAll();
      expect(papers).toHaveLength(2);
    });

    it('should respect limit parameter', async () => {
      await repository.create(mockCreatePaperInput);
      await repository.create(mockCreatePaperInput);
      await repository.create(mockCreatePaperInput);
      
      const papers = await repository.findAll(2);
      expect(papers).toHaveLength(2);
    });

    it('should respect offset parameter', async () => {
      await repository.create(mockCreatePaperInput);
      const paper2 = await repository.create(mockCreatePaperInput);
      
      const papers = await repository.findAll(1, 1);
      expect(papers).toHaveLength(1);
      expect(papers[0]?.id).toBe(paper2.id);
    });
  });

  describe('update', () => {
    it('should update an existing paper', async () => {
      const created = await repository.create(mockCreatePaperInput);
      const updated = await repository.update(created.id, mockUpdatePaperInput);
      
      expect(updated).toBeDefined();
      expect(updated?.title).toBe(mockUpdatePaperInput.title);
      expect(updated?.abstract).toBe(mockUpdatePaperInput.abstract);
      expect(updated?.keywords).toEqual(mockUpdatePaperInput.keywords);
    });

    it('should return null for non-existent paper', async () => {
      const updated = await repository.update('non-existent-id', mockUpdatePaperInput);
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing paper', async () => {
      const created = await repository.create(mockCreatePaperInput);
      const deleted = await repository.delete(created.id);
      
      expect(deleted).toBe(true);
      
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent paper', async () => {
      const deleted = await repository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the correct count of papers', async () => {
      expect(await repository.count()).toBe(0);
      
      await repository.create(mockCreatePaperInput);
      expect(await repository.count()).toBe(1);
      
      await repository.create(mockCreatePaperInput);
      expect(await repository.count()).toBe(2);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await repository.create(mockCreatePaperInput);
      await repository.create({
        ...mockCreatePaperInput,
        title: 'Another Paper',
        abstract: 'Different content'
      });
    });

    it('should search papers by title', async () => {
      const result = await repository.search({ query: 'Test Paper' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Paper Title');
    });

    it('should search papers by abstract', async () => {
      const result = await repository.search({ query: 'Different content' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Another Paper');
    });

    it('should return paginated results', async () => {
      const result = await repository.search({ page: 1, limit: 1 });
      
      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('findByDoi', () => {
    it('should find paper by DOI', async () => {
      const created = await repository.create(mockCreatePaperInput);
      const found = await repository.findByDoi(created.doi!);
      
      expect(found).toBeDefined();
      expect(found?.doi).toBe(created.doi);
    });

    it('should return null for non-existent DOI', async () => {
      const found = await repository.findByDoi('non-existent-doi');
      expect(found).toBeNull();
    });
  });

  describe('findByAuthor', () => {
    it('should find papers by author name', async () => {
      await repository.create(mockCreatePaperInput);
      const papers = await repository.findByAuthor('John Doe');
      
      expect(papers).toHaveLength(1);
      expect(papers[0].authors.some(a => a.name === 'John Doe')).toBe(true);
    });
  });

  describe('findByKeyword', () => {
    it('should find papers by keyword', async () => {
      await repository.create(mockCreatePaperInput);
      const papers = await repository.findByKeyword('test');
      
      expect(papers).toHaveLength(1);
      expect(papers[0].keywords).toContain('test');
    });
  });

  describe('findByJournal', () => {
    it('should find papers by journal', async () => {
      await repository.create(mockCreatePaperInput);
      const papers = await repository.findByJournal('Test Journal');
      
      expect(papers).toHaveLength(1);
      expect(papers[0].journal).toBe('Test Journal');
    });
  });

  describe('findByDateRange', () => {
    it('should find papers within date range', async () => {
      await repository.create(mockCreatePaperInput);
      const papers = await repository.findByDateRange('2023-01-01', '2023-12-31');
      
      expect(papers).toHaveLength(1);
    });

    it('should return empty array for papers outside date range', async () => {
      await repository.create(mockCreatePaperInput);
      const papers = await repository.findByDateRange('2024-01-01', '2024-12-31');
      
      expect(papers).toHaveLength(0);
    });
  });
}); 