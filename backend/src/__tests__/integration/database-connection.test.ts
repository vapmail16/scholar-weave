import { databaseConnection } from '@/config/database';
import { repositoryFactory } from '@/repositories/RepositoryFactory';
import { CreatePaperInput } from '@/types';

describe('Database Connection Integration', () => {
  beforeAll(async () => {
    // Initialize database connection
    await databaseConnection.connect();
    await repositoryFactory.initialize();
  });

  afterAll(async () => {
    // Clean up database connection
    await repositoryFactory.close();
  });

  it('should connect to the database successfully', () => {
    expect(databaseConnection.isConnectedToDatabase()).toBe(true);
  });

  it('should be able to create and retrieve a paper', async () => {
    const paperRepository = repositoryFactory.getPaperRepository();
    
    const paperData: CreatePaperInput = {
      title: 'Test Integration Paper',
      authors: [
        { name: 'Integration Test Author', affiliation: 'Test University' }
      ],
      abstract: 'This is a test paper for integration testing.',
      keywords: ['integration', 'test', 'database'],
      publicationDate: '2023-01-01',
      journal: 'Test Journal',
      doi: '10.1000/test.integration.001'
    };

    // Create paper
    const createdPaper = await paperRepository.create(paperData);
    expect(createdPaper).toBeDefined();
    expect(createdPaper.title).toBe(paperData.title);
    expect(createdPaper.id).toBeDefined();

    // Retrieve paper
    const retrievedPaper = await paperRepository.findById(createdPaper.id);
    expect(retrievedPaper).toBeDefined();
    expect(retrievedPaper?.title).toBe(paperData.title);
    expect(retrievedPaper?.doi).toBe(paperData.doi);

    // Clean up
    await paperRepository.delete(createdPaper.id);
  });

  it('should handle database operations with proper error handling', async () => {
    const paperRepository = repositoryFactory.getPaperRepository();
    
    // Try to find non-existent paper
    const nonExistentPaper = await paperRepository.findById('non-existent-id');
    expect(nonExistentPaper).toBeNull();

    // Try to delete non-existent paper
    const deleteResult = await paperRepository.delete('non-existent-id');
    expect(deleteResult).toBe(false);
  });
}); 