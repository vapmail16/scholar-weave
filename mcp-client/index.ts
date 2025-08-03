import axios from 'axios';

// MCP Client for ScholarWeave
class ScholarWeaveMCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3002/api/mcp') {
    this.baseUrl = baseUrl;
  }

  // Health check
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Discover available tools
  async discoverTools() {
    try {
      const response = await axios.get(`${this.baseUrl}/tools`);
      return response.data;
    } catch (error) {
      console.error('Tool discovery failed:', error);
      throw error;
    }
  }

  // Execute MCP tool
  async executeTool(name: string, args: any = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/tools/call`, {
        name,
        arguments: args
      });
      return response.data;
    } catch (error) {
      console.error(`Tool execution failed for ${name}:`, error);
      throw error;
    }
  }

  // Convenience methods for papers
  async fetchPapers(options: {
    limit?: number;
    offset?: number;
    search?: string;
    author?: string;
    journal?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.search) params.append('search', options.search);
      if (options.author) params.append('author', options.author);
      if (options.journal) params.append('journal', options.journal);
      if (options.dateFrom) params.append('dateFrom', options.dateFrom);
      if (options.dateTo) params.append('dateTo', options.dateTo);
      if (options.tags) params.append('tags', options.tags.join(','));

      const response = await axios.get(`${this.baseUrl}/papers?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fetch papers failed:', error);
      throw error;
    }
  }

  async fetchPaperById(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/papers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch paper by ID failed for ${id}:`, error);
      throw error;
    }
  }

  // Convenience methods for notes
  async fetchNotes(options: {
    limit?: number;
    offset?: number;
    paperId?: string;
    tags?: string[];
    search?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.paperId) params.append('paperId', options.paperId);
      if (options.tags) params.append('tags', options.tags.join(','));
      if (options.search) params.append('search', options.search);

      const response = await axios.get(`${this.baseUrl}/notes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fetch notes failed:', error);
      throw error;
    }
  }

  async fetchNoteById(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch note by ID failed for ${id}:`, error);
      throw error;
    }
  }

  async fetchNotesByPaper(paperId: string, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await axios.get(`${this.baseUrl}/papers/${paperId}/notes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch notes by paper failed for ${paperId}:`, error);
      throw error;
    }
  }
}

// Demo application
async function runDemo() {
  console.log('🚀 ScholarWeave MCP Client Demo');
  console.log('================================\n');

  const client = new ScholarWeaveMCPClient();

  try {
    // 1. Health check
    console.log('1. Checking MCP server health...');
    const health = await client.checkHealth();
    console.log('✅ Health:', health);
    console.log('');

    // 2. Discover tools
    console.log('2. Discovering available tools...');
    const tools = await client.discoverTools();
    console.log(`✅ Found ${tools.count} tools:`);
    tools.data.forEach((tool: any) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // 3. Fetch papers using MCP tool
    console.log('3. Fetching papers using MCP tool...');
    const papersResult = await client.executeTool('fetch_papers', { limit: 3 });
    console.log(`✅ Found ${papersResult.count} papers using MCP tool`);
    papersResult.data.forEach((paper: any) => {
      console.log(`   - ${paper.title} (${paper.id})`);
    });
    console.log('');

    // 4. Fetch papers using REST endpoint
    console.log('4. Fetching papers using REST endpoint...');
    const papersRest = await client.fetchPapers({ limit: 3 });
    console.log(`✅ Found ${papersRest.count} papers using REST endpoint`);
    papersRest.data.forEach((paper: any) => {
      console.log(`   - ${paper.title} (${paper.id})`);
    });
    console.log('');

    // 5. Fetch notes using MCP tool
    console.log('5. Fetching notes using MCP tool...');
    const notesResult = await client.executeTool('fetch_notes', { limit: 5 });
    console.log(`✅ Found ${notesResult.count} notes using MCP tool`);
    notesResult.data.forEach((note: any) => {
      console.log(`   - Note ${note.id}: ${note.content.substring(0, 50)}...`);
    });
    console.log('');

    // 6. Fetch notes using REST endpoint
    console.log('6. Fetching notes using REST endpoint...');
    const notesRest = await client.fetchNotes({ limit: 5 });
    console.log(`✅ Found ${notesRest.count} notes using REST endpoint`);
    notesRest.data.forEach((note: any) => {
      console.log(`   - Note ${note.id}: ${note.content.substring(0, 50)}...`);
    });
    console.log('');

    // 7. Fetch specific paper by ID
    if (papersResult.data.length > 0) {
      const paperId = papersResult.data[0].id;
      console.log(`7. Fetching specific paper by ID: ${paperId}...`);
      const paper = await client.fetchPaperById(paperId);
      console.log(`✅ Paper details: ${paper.data.title}`);
      console.log(`   Authors: ${paper.data.authors.map((a: any) => a.name).join(', ')}`);
      console.log(`   Journal: ${paper.data.journal}`);
      console.log('');

      // 8. Fetch notes for this paper
      console.log(`8. Fetching notes for paper: ${paperId}...`);
      const paperNotes = await client.fetchNotesByPaper(paperId);
      console.log(`✅ Found ${paperNotes.count} notes for this paper`);
      if (paperNotes.data.length > 0) {
        paperNotes.data.forEach((note: any) => {
          console.log(`   - Note ${note.id}: ${note.content.substring(0, 50)}...`);
        });
      } else {
        console.log('   No notes found for this paper');
      }
    }

    console.log('\n🎉 Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use in other modules
export { ScholarWeaveMCPClient };

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo();
} 