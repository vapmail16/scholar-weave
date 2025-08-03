# ScholarWeave MCP Client

A simple client application that demonstrates how to use the ScholarWeave MCP (Model Context Protocol) endpoints.

## 🚀 Features

- **Health Check**: Verify MCP server status
- **Tool Discovery**: Discover available MCP tools
- **Tool Execution**: Execute MCP tools with arguments
- **REST Endpoints**: Use convenience REST endpoints
- **Paper Management**: Fetch papers with filtering and pagination
- **Note Management**: Fetch notes with filtering and pagination

## 📦 Installation

```bash
cd mcp-client
npm install
```

## 🏃‍♂️ Usage

### Run the Demo

```bash
npm start
```

This will run a comprehensive demo that shows:
1. Health check
2. Tool discovery
3. Fetching papers using MCP tools
4. Fetching papers using REST endpoints
5. Fetching notes using MCP tools
6. Fetching notes using REST endpoints
7. Fetching specific papers by ID
8. Fetching notes for specific papers

### Use as a Library

```typescript
import { ScholarWeaveMCPClient } from './index';

const client = new ScholarWeaveMCPClient();

// Health check
const health = await client.checkHealth();

// Discover tools
const tools = await client.discoverTools();

// Execute MCP tool
const papers = await client.executeTool('fetch_papers', { limit: 10 });

// Use REST endpoints
const papersRest = await client.fetchPapers({ limit: 10, search: 'machine learning' });
const notesRest = await client.fetchNotes({ paperId: 'paper-id' });
```

## 🔧 API Reference

### Constructor

```typescript
new ScholarWeaveMCPClient(baseUrl?: string)
```

- `baseUrl`: MCP server base URL (default: `http://localhost:3002/api/mcp`)

### Methods

#### Health Check
```typescript
async checkHealth(): Promise<any>
```

#### Tool Discovery
```typescript
async discoverTools(): Promise<any>
```

#### Tool Execution
```typescript
async executeTool(name: string, arguments?: any): Promise<any>
```

#### Paper Management
```typescript
async fetchPapers(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  author?: string;
  journal?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}): Promise<any>

async fetchPaperById(id: string): Promise<any>
```

#### Note Management
```typescript
async fetchNotes(options?: {
  limit?: number;
  offset?: number;
  paperId?: string;
  tags?: string[];
  search?: string;
}): Promise<any>

async fetchNoteById(id: string): Promise<any>

async fetchNotesByPaper(paperId: string, limit?: number): Promise<any>
```

## 🌐 Available MCP Tools

1. **`fetch_papers`** - Fetch research papers with filtering
2. **`fetch_paper_by_id`** - Fetch specific paper by ID
3. **`fetch_notes`** - Fetch research notes with filtering
4. **`fetch_note_by_id`** - Fetch specific note by ID
5. **`fetch_notes_by_paper`** - Fetch notes associated with a paper

## 📊 Example Output

```
🚀 ScholarWeave MCP Client Demo
================================

1. Checking MCP server health...
✅ Health: { status: 'ok', service: 'ScholarWeave MCP Server', tools: 5 }

2. Discovering available tools...
✅ Found 5 tools:
   - fetch_papers: Fetch research papers from ScholarWeave with optional filtering and pagination
   - fetch_paper_by_id: Fetch a specific research paper by its ID
   - fetch_notes: Fetch research notes from ScholarWeave with optional filtering
   - fetch_note_by_id: Fetch a specific research note by its ID
   - fetch_notes_by_paper: Fetch all notes associated with a specific paper

3. Fetching papers using MCP tool...
✅ Found 1 papers using MCP tool
   - Amazon Listing Best Practises V01 23Nov23 (cmdrya5la00016d1a28g7j3wo)

4. Fetching papers using REST endpoint...
✅ Found 1 papers using REST endpoint
   - Amazon Listing Best Practises V01 23Nov23 (cmdrya5la00016d1a28g7j3wo)

5. Fetching notes using MCP tool...
✅ Found 1 notes using MCP tool
   - Note cmdryae2m00056d1a67rr0ekp: this is my first note...

6. Fetching notes using REST endpoint...
✅ Found 1 notes using REST endpoint
   - Note cmdryae2m00056d1a67rr0ekp: this is my first note...

7. Fetching specific paper by ID: cmdrya5la00016d1a28g7j3wo...
✅ Paper details: Amazon Listing Best Practises V01 23Nov23
   Authors: Unknown Author
   Journal: Imported Paper

8. Fetching notes for paper: cmdrya5la00016d1a28g7j3wo...
✅ Found 0 notes for this paper
   No notes found for this paper

🎉 Demo completed successfully!
```

## 🔗 Prerequisites

- ScholarWeave backend server running on `http://localhost:3002`
- Node.js 18+ and npm

## 📝 License

MIT License 