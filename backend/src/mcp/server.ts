import { RepositoryFactory } from '../database/repositories/RepositoryFactory';
import { Paper, Note, SearchParams, PaginatedResponse } from '../index';

// MCP Tool Definitions
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: any[];
  isError?: boolean;
  error?: string;
}

// MCP Server for ScholarWeave
export class ScholarWeaveMCPServer {
  private repositoryFactory: RepositoryFactory;

  constructor() {
    this.repositoryFactory = RepositoryFactory.getInstance();
  }

  // Get available tools
  getTools(): MCPTool[] {
    return [
      {
        name: "fetch_papers",
        description: "Fetch research papers from ScholarWeave with optional filtering and pagination",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of papers to return (default: 10, max: 100)"
            },
            offset: {
              type: "number", 
              description: "Number of papers to skip for pagination (default: 0)"
            },
            search: {
              type: "string",
              description: "Search papers by title, abstract, or keywords"
            },
            author: {
              type: "string",
              description: "Filter papers by author name"
            },
            journal: {
              type: "string",
              description: "Filter papers by journal name"
            },
            dateFrom: {
              type: "string",
              description: "Filter papers published from this date (ISO format)"
            },
            dateTo: {
              type: "string",
              description: "Filter papers published until this date (ISO format)"
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Filter papers by tags"
            }
          }
        }
      },
      {
        name: "fetch_paper_by_id",
        description: "Fetch a specific research paper by its ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique identifier of the paper"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "fetch_notes",
        description: "Fetch research notes from ScholarWeave with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of notes to return (default: 50, max: 100)"
            },
            offset: {
              type: "number",
              description: "Number of notes to skip for pagination (default: 0)"
            },
            paperId: {
              type: "string",
              description: "Filter notes by associated paper ID"
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Filter notes by tags"
            },
            search: {
              type: "string",
              description: "Search notes by content"
            }
          }
        }
      },
      {
        name: "fetch_note_by_id",
        description: "Fetch a specific research note by its ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique identifier of the note"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "fetch_notes_by_paper",
        description: "Fetch all notes associated with a specific paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: {
              type: "string",
              description: "The ID of the paper to fetch notes for"
            },
            limit: {
              type: "number",
              description: "Maximum number of notes to return (default: 50)"
            }
          },
          required: ["paperId"]
        }
      }
    ];
  }

  // Execute a tool call
  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    try {
      switch (call.name) {
        case "fetch_papers":
          return await this.fetchPapers(call.arguments);
        case "fetch_paper_by_id":
          return await this.fetchPaperById(call.arguments);
        case "fetch_notes":
          return await this.fetchNotes(call.arguments);
        case "fetch_note_by_id":
          return await this.fetchNoteById(call.arguments);
        case "fetch_notes_by_paper":
          return await this.fetchNotesByPaper(call.arguments);
        default:
          return {
            content: [],
            isError: true,
            error: `Unknown tool: ${call.name}`
          };
      }
    } catch (error) {
      return {
        content: [],
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Tool implementations
  private async fetchPapers(args: any): Promise<MCPToolResult> {
    const paperRepository = this.repositoryFactory.getPaperRepository();
    const limit = Math.min(args.limit || 10, 100);
    const offset = args.offset || 0;

    let papers: Paper[];

    if (args.search) {
      // Use search functionality
      const searchParams: SearchParams = {
        query: args.search,
        limit,
        offset,
        filters: {
          author: args.author,
          journal: args.journal,
          dateFrom: args.dateFrom,
          dateTo: args.dateTo,
          tags: args.tags
        }
      };
      const result = await paperRepository.search(searchParams);
      papers = result.data;
    } else {
      // Use basic findAll with filters
      papers = await paperRepository.findAll(limit, offset);
      
      // Apply additional filters if provided
      if (args.author) {
        papers = papers.filter(p => 
          p.authors?.some(author => 
            author.toLowerCase().includes(args.author.toLowerCase())
          )
        );
      }
      
      if (args.journal) {
        papers = papers.filter(p => 
          p.journal?.toLowerCase().includes(args.journal.toLowerCase())
        );
      }
    }

    return {
      content: papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        keywords: paper.keywords,
        publicationDate: paper.publicationDate,
        journal: paper.journal,
        doi: paper.doi,
        url: paper.url,
        createdAt: paper.createdAt,
        updatedAt: paper.updatedAt
      }))
    };
  }

  private async fetchPaperById(args: any): Promise<MCPToolResult> {
    const paperRepository = this.repositoryFactory.getPaperRepository();
    const paper = await paperRepository.findById(args.id);

    if (!paper) {
      return {
        content: [],
        isError: true,
        error: `Paper with id ${args.id} not found`
      };
    }

    return {
      content: [{
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        keywords: paper.keywords,
        publicationDate: paper.publicationDate,
        journal: paper.journal,
        doi: paper.doi,
        url: paper.url,
        filePath: paper.filePath,
        metadata: paper.metadata,
        createdAt: paper.createdAt,
        updatedAt: paper.updatedAt
      }]
    };
  }

  private async fetchNotes(args: any): Promise<MCPToolResult> {
    const noteRepository = this.repositoryFactory.getNoteRepository();
    const limit = Math.min(args.limit || 50, 100);
    const offset = args.offset || 0;

    let notes: Note[];

    if (args.paperId) {
      notes = await noteRepository.findByPaperId(args.paperId);
    } else if (args.search) {
      notes = await noteRepository.findByContent(args.search);
    } else if (args.tags && args.tags.length > 0) {
      // Filter by tags
      const allNotes = await noteRepository.findAll(limit, offset);
      notes = allNotes.filter(note => 
        note.tags?.some(tag => 
          args.tags.includes(tag)
        )
      );
    } else {
      notes = await noteRepository.findAll(limit, offset);
    }

    return {
      content: notes.map(note => ({
        id: note.id,
        paperId: note.paperId,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    };
  }

  private async fetchNoteById(args: any): Promise<MCPToolResult> {
    const noteRepository = this.repositoryFactory.getNoteRepository();
    const note = await noteRepository.findById(args.id);

    if (!note) {
      return {
        content: [],
        isError: true,
        error: `Note with id ${args.id} not found`
      };
    }

    return {
      content: [{
        id: note.id,
        paperId: note.paperId,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }]
    };
  }

  private async fetchNotesByPaper(args: any): Promise<MCPToolResult> {
    const noteRepository = this.repositoryFactory.getNoteRepository();
    const limit = args.limit || 50;
    
    const notes = await noteRepository.findByPaperId(args.paperId);
    const limitedNotes = notes.slice(0, limit);

    return {
      content: limitedNotes.map(note => ({
        id: note.id,
        paperId: note.paperId,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    };
  }
} 