// TDD approach: Write failing tests first, then implement

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  createdAt: string;
}

interface IPaperRepository {
  create(paper: Omit<Paper, 'id' | 'createdAt'>): Promise<Paper>;
  findById(id: string): Promise<Paper | null>;
  update(id: string, paper: Partial<Paper>): Promise<Paper | null>;
  delete(id: string): Promise<boolean>;
}

// Mock implementation for testing
class MockPaperRepository implements IPaperRepository {
  private papers: Paper[] = [];

  async create(paperData: Omit<Paper, 'id' | 'createdAt'>): Promise<Paper> {
    const paper: Paper = {
      id: `paper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...paperData,
      createdAt: new Date().toISOString()
    };
    this.papers.push(paper);
    return paper;
  }

  async findById(id: string): Promise<Paper | null> {
    return this.papers.find(paper => paper.id === id) || null;
  }

  async update(id: string, paperData: Partial<Paper>): Promise<Paper | null> {
    const index = this.papers.findIndex(paper => paper.id === id);
    if (index === -1) return null;
    
    const existingPaper = this.papers[index];
    if (!existingPaper) return null;
    
    const updatedPaper: Paper = { 
      id: existingPaper.id,
      title: paperData.title ?? existingPaper.title,
      abstract: paperData.abstract ?? existingPaper.abstract,
      authors: paperData.authors ?? existingPaper.authors,
      createdAt: existingPaper.createdAt
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
}

describe('PaperRepository - TDD Implementation', () => {
  let repository: IPaperRepository;

  beforeEach(() => {
    repository = new MockPaperRepository();
  });

  describe('create', () => {
    it('should create a new paper with generated ID and timestamp', async () => {
      const paperData = {
        title: 'Test Paper',
        abstract: 'This is a test paper',
        authors: ['John Doe', 'Jane Smith']
      };

      const result = await repository.create(paperData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(paperData.title);
      expect(result.abstract).toBe(paperData.abstract);
      expect(result.authors).toEqual(paperData.authors);
      expect(result.createdAt).toBeDefined();
    });

    it('should generate unique IDs for different papers', async () => {
      const paperData = {
        title: 'Test Paper',
        abstract: 'This is a test paper',
        authors: ['John Doe']
      };

      const paper1 = await repository.create(paperData);
      const paper2 = await repository.create(paperData);

      expect(paper1.id).not.toBe(paper2.id);
    });
  });

  describe('findById', () => {
    it('should find a paper by its ID', async () => {
      const paperData = {
        title: 'Test Paper',
        abstract: 'This is a test paper',
        authors: ['John Doe']
      };

      const created = await repository.create(paperData);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe(created.title);
    });

    it('should return null for non-existent paper ID', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing paper', async () => {
      const paperData = {
        title: 'Original Title',
        abstract: 'Original abstract',
        authors: ['John Doe']
      };

      const created = await repository.create(paperData);
      const updated = await repository.update(created.id, { title: 'Updated Title' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.abstract).toBe(created.abstract); // Should remain unchanged
    });

    it('should return null when updating non-existent paper', async () => {
      const updated = await repository.update('non-existent-id', { title: 'New Title' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing paper', async () => {
      const paperData = {
        title: 'Test Paper',
        abstract: 'This is a test paper',
        authors: ['John Doe']
      };

      const created = await repository.create(paperData);
      const deleted = await repository.delete(created.id);

      expect(deleted).toBe(true);

      // Verify paper is no longer findable
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent paper', async () => {
      const deleted = await repository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
}); 