import { CreatePaperInput, Paper, Author } from '@/types';

export const mockAuthors: Omit<Author, 'id'>[] = [
  {
    name: 'John Doe',
    affiliation: 'University of Technology',
    email: 'john.doe@university.edu'
  },
  {
    name: 'Jane Smith',
    affiliation: 'Research Institute',
    email: 'jane.smith@research.org'
  }
];

export const mockCreatePaperInput: CreatePaperInput = {
  title: 'Test Paper Title',
  authors: mockAuthors,
  abstract: 'This is a test abstract for the paper.',
  keywords: ['test', 'research', 'technology'],
  publicationDate: '2023-01-15',
  journal: 'Test Journal',
  doi: '10.1000/test.2023.001',
  url: 'https://example.com/paper',
  metadata: {
    volume: '1',
    issue: '1',
    pages: '1-10'
  }
};

export const mockPaper: Paper = {
  id: 'paper-1',
  title: 'Test Paper Title',
  authors: [
    { id: 'author-1', name: mockAuthors[0]!.name, affiliation: mockAuthors[0]!.affiliation, email: mockAuthors[0]!.email },
    { id: 'author-2', name: mockAuthors[1]!.name, affiliation: mockAuthors[1]!.affiliation, email: mockAuthors[1]!.email }
  ],
  abstract: 'This is a test abstract for the paper.',
  keywords: ['test', 'research', 'technology'],
  publicationDate: '2023-01-15',
  journal: 'Test Journal',
  doi: '10.1000/test.2023.001',
  url: 'https://example.com/paper',
  citations: [],
  metadata: {
    volume: '1',
    issue: '1',
    pages: '1-10'
  },
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z'
};

export const mockPapers: Paper[] = [
  mockPaper,
  {
    ...mockPaper,
    id: 'paper-2',
    title: 'Another Test Paper',
    doi: '10.1000/test.2023.002',
    authors: [{ id: 'author-3', name: 'Bob Wilson', affiliation: 'Tech Corp' }]
  },
  {
    ...mockPaper,
    id: 'paper-3',
    title: 'Third Test Paper',
    doi: '10.1000/test.2023.003',
    authors: [{ id: 'author-4', name: 'Alice Brown', affiliation: 'Science Lab' }]
  }
];

export const mockUpdatePaperInput = {
  title: 'Updated Paper Title',
  abstract: 'Updated abstract content.',
  keywords: ['updated', 'research', 'technology']
}; 