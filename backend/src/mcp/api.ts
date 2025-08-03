import express from 'express';
import { ScholarWeaveMCPServer, MCPToolCall } from './server';

const router = express.Router();
const mcpServer = new ScholarWeaveMCPServer();

// MCP Tools discovery endpoint
router.get('/tools', (_req, res) => {
  try {
    const tools = mcpServer.getTools();
    res.json({
      status: 'success',
      data: tools,
      count: tools.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Tool execution endpoint
router.post('/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body as MCPToolCall;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Tool name is required'
      });
    }

    const result = await mcpServer.executeTool({ name, arguments: args || {} });
    
    if (result.isError) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content,
      count: result.content.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Convenience endpoints for common operations

// Fetch papers with query parameters
router.get('/papers', async (req, res) => {
  try {
    const args = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      search: req.query.search as string,
      author: req.query.author as string,
      journal: req.query.journal as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
    };

    const result = await mcpServer.executeTool({ name: 'fetch_papers', arguments: args });
    
    if (result.isError) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content,
      count: result.content.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch a specific paper by ID
router.get('/papers/:id', async (req, res) => {
  try {
    const result = await mcpServer.executeTool({ 
      name: 'fetch_paper_by_id', 
      arguments: { id: req.params.id } 
    });
    
    if (result.isError) {
      return res.status(404).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch notes with query parameters
router.get('/notes', async (req, res) => {
  try {
    const args = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      paperId: req.query.paperId as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string
    };

    const result = await mcpServer.executeTool({ name: 'fetch_notes', arguments: args });
    
    if (result.isError) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content,
      count: result.content.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch a specific note by ID
router.get('/notes/:id', async (req, res) => {
  try {
    const result = await mcpServer.executeTool({ 
      name: 'fetch_note_by_id', 
      arguments: { id: req.params.id } 
    });
    
    if (result.isError) {
      return res.status(404).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch notes by paper ID
router.get('/papers/:paperId/notes', async (req, res) => {
  try {
    const args = {
      paperId: req.params.paperId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await mcpServer.executeTool({ name: 'fetch_notes_by_paper', arguments: args });
    
    if (result.isError) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
        data: result.content
      });
    }

    res.json({
      status: 'success',
      data: result.content,
      count: result.content.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MCP Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ScholarWeave MCP Server',
    version: '1.0.0',
    tools: mcpServer.getTools().length
  });
});

export default router; 