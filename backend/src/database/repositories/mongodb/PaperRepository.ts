import { IPaperRepository, RepositoryError, DuplicateEntityError } from '../../../repository';
import { Paper, CreatePaperInput, UpdatePaperInput, SearchParams, PaginatedResponse } from '../../../index';
import { PaperModel, IPaperDocument } from '../../models/mongodb/Paper';
import { CitationModel } from '../../models/mongodb/Citation';

export class MongoPaperRepository implements IPaperRepository {
  async create(data: CreatePaperInput): Promise<Paper> {
    try {
      const paperDoc = new PaperModel({
        title: data.title,
        abstract: data.abstract,
        keywords: data.keywords,
        publicationDate: new Date(data.publicationDate),
        journal: data.journal,
        conference: data.conference,
        doi: data.doi,
        url: data.url,
        filePath: data.filePath,
        authors: data.authors || [],
        metadata: data.metadata
      });

      const savedPaper = await paperDoc.save();
      return this.mapToPaper(savedPaper);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new DuplicateEntityError('Paper', 'doi', data.doi || 'unknown');
      }
      throw new RepositoryError('Failed to create paper', 'CREATE_ERROR');
    }
  }

  async findById(id: string): Promise<Paper | null> {
    try {
      const paper = await PaperModel.findById(id);
      return paper ? this.mapToPaper(paper) : null;
    } catch (error) {
      throw new RepositoryError('Failed to find paper by ID', 'FIND_ERROR');
    }
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<Paper[]> {
    try {
      const papers = await PaperModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to find papers', 'FIND_ERROR');
    }
  }

  async update(id: string, data: UpdatePaperInput): Promise<Paper | null> {
    try {
      const updateData: any = {};
      if (data.title) updateData.title = data.title;
      if (data.abstract) updateData.abstract = data.abstract;
      if (data.keywords) updateData.keywords = data.keywords;
      if (data.publicationDate) updateData.publicationDate = new Date(data.publicationDate);
      if (data.journal !== undefined) updateData.journal = data.journal;
      if (data.conference !== undefined) updateData.conference = data.conference;
      if (data.doi !== undefined) updateData.doi = data.doi;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.filePath !== undefined) updateData.filePath = data.filePath;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      const paper = await PaperModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return paper ? this.mapToPaper(paper) : null;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new DuplicateEntityError('Paper', 'doi', data.doi || 'unknown');
      }
      throw new RepositoryError('Failed to update paper', 'UPDATE_ERROR');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await PaperModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new RepositoryError('Failed to delete paper', 'DELETE_ERROR');
    }
  }

  async count(): Promise<number> {
    try {
      return await PaperModel.countDocuments();
    } catch (error) {
      throw new RepositoryError('Failed to count papers', 'COUNT_ERROR');
    }
  }

  async search(params: SearchParams): Promise<PaginatedResponse<Paper>> {
    try {
      const { query, limit = 10, page = 1, sortBy = 'date', sortOrder = 'desc' } = params;
      const skip = (page - 1) * limit;

      let filter: any = {};
      
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { abstract: { $regex: query, $options: 'i' } },
          { keywords: { $in: [new RegExp(query, 'i')] } }
        ];
      }

      if (params.authors && params.authors.length > 0) {
        filter['authors.name'] = { $in: params.authors };
      }

      if (params.keywords && params.keywords.length > 0) {
        filter.keywords = { $in: params.keywords };
      }

      if (params.dateFrom || params.dateTo) {
        filter.publicationDate = {};
        if (params.dateFrom) filter.publicationDate.$gte = new Date(params.dateFrom);
        if (params.dateTo) filter.publicationDate.$lte = new Date(params.dateTo);
      }

      if (params.journal) {
        filter.journal = { $regex: params.journal, $options: 'i' };
      }

      if (params.conference) {
        filter.conference = { $regex: params.conference, $options: 'i' };
      }

      let sort: any = {};
      switch (sortBy) {
        case 'title':
          sort.title = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'citations':
          sort.citationCount = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'relevance':
          // For relevance, we'll keep the default MongoDB scoring
          break;
        default:
          sort.publicationDate = sortOrder === 'asc' ? 1 : -1;
      }

      const [papers, total] = await Promise.all([
        PaperModel.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        PaperModel.countDocuments(filter)
      ]);

      return {
        data: papers.map(paper => this.mapToPaper(paper)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        status: 'success'
      };
    } catch (error) {
      throw new RepositoryError('Failed to search papers', 'SEARCH_ERROR');
    }
  }

  async findByDoi(doi: string): Promise<Paper | null> {
    try {
      const paper = await PaperModel.findOne({ doi });
      return paper ? this.mapToPaper(paper) : null;
    } catch (error) {
      throw new RepositoryError('Failed to find paper by DOI', 'FIND_ERROR');
    }
  }

  async findByAuthor(_authorName: string): Promise<Paper[]> {
    try {
      const papers = await PaperModel.find({
        'authors.name': { $regex: _authorName, $options: 'i' }
      }).sort({ publicationDate: -1 });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to find papers by author', 'FIND_ERROR');
    }
  }

  async findByKeyword(keyword: string): Promise<Paper[]> {
    try {
      const papers = await PaperModel.find({
        keywords: { $regex: keyword, $options: 'i' }
      }).sort({ createdAt: -1 });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to find papers by keyword', 'FIND_ERROR');
    }
  }

  async findByJournal(journal: string): Promise<Paper[]> {
    try {
      const papers = await PaperModel.find({
        journal: { $regex: journal, $options: 'i' }
      }).sort({ createdAt: -1 });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to find papers by journal', 'FIND_ERROR');
    }
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Paper[]> {
    try {
      const papers = await PaperModel.find({
        publicationDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).sort({ publicationDate: -1 });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to find papers by date range', 'FIND_ERROR');
    }
  }

  async getCitations(paperId: string): Promise<any[]> {
    try {
      const citations = await CitationModel.find({ sourcePaperId: paperId });
      return citations.map(citation => ({
        id: (citation._id as any).toString(),
        sourcePaperId: citation.sourcePaperId,
        targetPaperId: citation.targetPaperId,
        context: citation.context,
        citationType: citation.citationType,
        pageNumber: citation.pageNumber,
        createdAt: citation.createdAt
      }));
    } catch (error) {
      throw new RepositoryError('Failed to get citations', 'FIND_ERROR');
    }
  }

  async getCitedBy(paperId: string): Promise<Paper[]> {
    try {
      const citations = await CitationModel.find({ targetPaperId: paperId });
      const sourcePaperIds = citations.map(c => c.sourcePaperId);
      
      if (sourcePaperIds.length === 0) return [];
      
      const papers = await PaperModel.find({
        _id: { $in: sourcePaperIds }
      });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to get cited by papers', 'FIND_ERROR');
    }
  }

  async addCitation(sourcePaperId: string, targetPaperId: string): Promise<void> {
    try {
      const citation = new CitationModel({
        sourcePaperId,
        targetPaperId,
        context: '',
        citationType: 'DIRECT'
      });
      await citation.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new DuplicateEntityError('Citation', 'paper pair', `${sourcePaperId}-${targetPaperId}`);
      }
      throw new RepositoryError('Failed to add citation', 'CREATE_ERROR');
    }
  }

  async removeCitation(sourcePaperId: string, targetPaperId: string): Promise<void> {
    try {
      await CitationModel.findOneAndDelete({
        sourcePaperId,
        targetPaperId
      });
    } catch (error) {
      throw new RepositoryError('Failed to remove citation', 'DELETE_ERROR');
    }
  }

  async getCitationCount(paperId: string): Promise<number> {
    try {
      return await CitationModel.countDocuments({ targetPaperId: paperId });
    } catch (error) {
      throw new RepositoryError('Failed to get citation count', 'COUNT_ERROR');
    }
  }

  async getCitationNetwork(paperId: string, _depth: number = 1): Promise<Paper[]> {
    try {
      // Get direct citations
      const citations = await CitationModel.find({ sourcePaperId: paperId });
      const citedPaperIds = citations.map(citation => citation.targetPaperId);
      
      // Get papers that cite this paper
      const citedBy = await CitationModel.find({ targetPaperId: paperId });
      const citingPaperIds = citedBy.map(citation => citation.sourcePaperId);
      
      // Combine all related paper IDs
      const allRelatedIds = [...citedPaperIds, ...citingPaperIds];
      
      if (allRelatedIds.length === 0) {
        return [];
      }
      
      // Get all related papers
      const papers = await PaperModel.find({
        _id: { $in: allRelatedIds }
      }).sort({ publicationDate: -1 });
      
      return papers.map(paper => this.mapToPaper(paper));
    } catch (error) {
      throw new RepositoryError('Failed to get citation network', 'FIND_ERROR');
    }
  }

  private mapToPaper(doc: IPaperDocument): Paper {
    return {
      id: (doc._id as any).toString(),
      title: doc.title,
      authors: doc.authors || [],
      abstract: doc.abstract,
      keywords: doc.keywords,
      publicationDate: doc.publicationDate.toISOString(),
      journal: doc.journal,
      conference: doc.conference,
      doi: doc.doi,
      url: doc.url,
      filePath: doc.filePath,
      citations: [], // This would need to be populated from citations collection
      metadata: doc.metadata || {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }
} 