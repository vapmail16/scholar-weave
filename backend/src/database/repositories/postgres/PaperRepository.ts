import { PrismaClient } from '@prisma/client';
import { IPaperRepository } from '../../../repository';
import { CreatePaperInput, UpdatePaperInput, Paper, SearchParams, PaginatedResponse } from '../../../index';
import { EntityNotFoundError, DuplicateEntityError } from '../../../repository';

export class PostgresPaperRepository implements IPaperRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreatePaperInput): Promise<Paper> {
    try {
      // Check if paper with same DOI already exists
      if (data.doi) {
        const existing = await this.prisma.paper.findUnique({
          where: { doi: data.doi }
        });
        if (existing) {
          throw new DuplicateEntityError('Paper', 'doi', data.doi);
        }
      }

      // Create paper with authors in a transaction
      const result = await this.prisma.$transaction(async (tx: any) => {
        // Create the paper
        const paper = await tx.paper.create({
          data: {
            title: data.title,
            abstract: data.abstract,
            keywords: data.keywords,
            publicationDate: new Date(data.publicationDate),
            journal: data.journal,
            conference: data.conference,
            doi: data.doi,
            url: data.url,
            filePath: data.filePath,
            metadata: data.metadata || {}
          }
        });

        // Create authors and link them to the paper
        for (let i = 0; i < data.authors.length; i++) {
          const authorData = data.authors[i];
          if (!authorData) continue;
          
          // Find or create author
          let author = await tx.author.findFirst({
            where: { 
              name: authorData.name,
              email: authorData.email || null
            }
          });

          if (!author) {
            author = await tx.author.create({
              data: {
                name: authorData.name,
                affiliation: authorData.affiliation,
                email: authorData.email
              }
            });
          }

          // Link author to paper
          await tx.paperAuthor.create({
            data: {
              paperId: paper.id,
              authorId: author.id,
              order: i
            }
          });
        }

        return paper;
      });

      // Return the created paper with authors
      return await this.findById(result.id) as Paper;
    } catch (error) {
      if (error instanceof DuplicateEntityError) {
        throw error;
      }
      throw new Error(`Failed to create paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Paper | null> {
    try {
      const paper = await this.prisma.paper.findUnique({
        where: { id },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        }
      });

      if (!paper) return null;

      return this.mapToPaper(paper);
    } catch (error) {
      throw new Error(`Failed to find paper by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<Paper[]> {
    try {
      const papers = await this.prisma.paper.findMany({
        take: limit,
        skip: offset,
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return papers.map((paper: any) => this.mapToPaper(paper));
    } catch (error) {
      throw new Error(`Failed to find all papers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, data: UpdatePaperInput): Promise<Paper | null> {
    try {
      const existingPaper = await this.prisma.paper.findUnique({
        where: { id },
        include: {
          authors: {
            include: {
              author: true
            }
          }
        }
      });

      if (!existingPaper) {
        throw new EntityNotFoundError('Paper', id);
      }

      // Check if DOI is being updated and if it conflicts
      if (data.doi && data.doi !== existingPaper.doi) {
        const existing = await this.prisma.paper.findUnique({
          where: { doi: data.doi }
        });
        if (existing) {
          throw new DuplicateEntityError('Paper', 'doi', data.doi);
        }
      }

      // Update paper in a transaction
      const result = await this.prisma.$transaction(async (tx: any) => {
        // Update the paper
        const updatedPaper = await tx.paper.update({
          where: { id },
          data: {
            title: data.title,
            abstract: data.abstract,
            keywords: data.keywords,
            publicationDate: data.publicationDate ? new Date(data.publicationDate) : undefined,
            journal: data.journal,
            conference: data.conference,
            doi: data.doi,
            url: data.url,
            filePath: data.filePath,
            metadata: data.metadata
          }
        });

        // Update authors if provided
        if (data.authors) {
          // Remove existing author relationships
          await tx.paperAuthor.deleteMany({
            where: { paperId: id }
          });

          // Create new author relationships
          for (let i = 0; i < data.authors.length; i++) {
            const authorData = data.authors[i];
            if (!authorData) continue;
            
            // Find or create author
            let author = await tx.author.findFirst({
              where: { 
                name: authorData.name,
                email: authorData.email || null
              }
            });

            if (!author) {
              author = await tx.author.create({
                data: {
                  name: authorData.name,
                  affiliation: authorData.affiliation,
                  email: authorData.email
                }
              });
            }

            // Link author to paper
            await tx.paperAuthor.create({
              data: {
                paperId: id,
                authorId: author.id,
                order: i
              }
            });
          }
        }

        return updatedPaper;
      });

      // Return the updated paper with authors
      return await this.findById(result.id) as Paper;
    } catch (error) {
      if (error instanceof EntityNotFoundError || error instanceof DuplicateEntityError) {
        throw error;
      }
      throw new Error(`Failed to update paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.prisma.paper.delete({
        where: { id }
      });
      return !!result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw new Error(`Failed to delete paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.paper.count();
    } catch (error) {
      throw new Error(`Failed to count papers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(params: SearchParams): Promise<PaginatedResponse<Paper>> {
    try {
      const where: any = {};

      // Build search conditions
      if (params.query) {
        where.OR = [
          { title: { contains: params.query, mode: 'insensitive' } },
          { abstract: { contains: params.query, mode: 'insensitive' } }
        ];
      }

      if (params.journal) {
        where.journal = { contains: params.journal, mode: 'insensitive' };
      }

      if (params.conference) {
        where.conference = { contains: params.conference, mode: 'insensitive' };
      }

      if (params.dateFrom || params.dateTo) {
        where.publicationDate = {};
        if (params.dateFrom) {
          where.publicationDate.gte = new Date(params.dateFrom);
        }
        if (params.dateTo) {
          where.publicationDate.lte = new Date(params.dateTo);
        }
      }

      // Build order by
      const orderBy: any = {};
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'date':
            orderBy.publicationDate = params.sortOrder || 'desc';
            break;
          case 'title':
            orderBy.title = params.sortOrder || 'asc';
            break;
          case 'relevance':
            // For relevance, we'll use creation date as fallback
            orderBy.createdAt = 'desc';
            break;
          default:
            orderBy.createdAt = 'desc';
        }
      } else {
        orderBy.createdAt = 'desc';
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.paper.count({ where });

      // Get papers
      const papers = await this.prisma.paper.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        }
      });

      return {
        data: papers.map((paper: any) => this.mapToPaper(paper)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        status: 'success'
      };
    } catch (error) {
      throw new Error(`Failed to search papers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByDoi(doi: string): Promise<Paper | null> {
    try {
      const paper = await this.prisma.paper.findUnique({
        where: { doi },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        }
      });

      return paper ? this.mapToPaper(paper) : null;
    } catch (error) {
      throw new Error(`Failed to find paper by DOI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByAuthor(authorName: string): Promise<Paper[]> {
    try {
      const papers = await this.prisma.paper.findMany({
        where: {
          authors: {
            some: {
              author: {
                name: {
                  contains: authorName,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        },
        orderBy: {
          publicationDate: 'desc'
        }
      });

      return papers.map((paper: any) => this.mapToPaper(paper));
    } catch (error) {
      throw new Error(`Failed to find papers by author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByKeyword(keyword: string): Promise<Paper[]> {
    try {
      const papers = await this.prisma.paper.findMany({
        where: {
          keywords: {
            has: keyword
          }
        },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        },
        orderBy: {
          publicationDate: 'desc'
        }
      });

      return papers.map((paper: any) => this.mapToPaper(paper));
    } catch (error) {
      throw new Error(`Failed to find papers by keyword: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByJournal(journal: string): Promise<Paper[]> {
    try {
      const papers = await this.prisma.paper.findMany({
        where: {
          journal: {
            contains: journal,
            mode: 'insensitive'
          }
        },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        },
        orderBy: {
          publicationDate: 'desc'
        }
      });

      return papers.map((paper: any) => this.mapToPaper(paper));
    } catch (error) {
      throw new Error(`Failed to find papers by journal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Paper[]> {
    try {
      const papers = await this.prisma.paper.findMany({
        where: {
          publicationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          authors: {
            include: {
              author: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          citations: {
            include: {
              targetPaper: true
            }
          }
        },
        orderBy: {
          publicationDate: 'desc'
        }
      });

      return papers.map((paper: any) => this.mapToPaper(paper));
    } catch (error) {
      throw new Error(`Failed to find papers by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCitations(paperId: string): Promise<any[]> {
    try {
      const citations = await this.prisma.citation.findMany({
        where: { sourcePaperId: paperId },
        include: {
          targetPaper: {
            include: {
              authors: {
                include: {
                  author: true
                },
                orderBy: {
                  order: 'asc'
                }
              }
            }
          }
        }
      });

      return citations.map((citation: any) => ({
        id: citation.id,
        sourcePaperId: citation.sourcePaperId,
        targetPaperId: citation.targetPaperId,
        context: citation.context,
        citationType: citation.citationType,
        pageNumber: citation.pageNumber,
        createdAt: citation.createdAt.toISOString(),
        targetPaper: this.mapToPaper(citation.targetPaper)
      }));
    } catch (error) {
      throw new Error(`Failed to get citations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCitedBy(paperId: string): Promise<Paper[]> {
    try {
      const citations = await this.prisma.citation.findMany({
        where: { targetPaperId: paperId },
        include: {
          sourcePaper: {
            include: {
              authors: {
                include: {
                  author: true
                },
                orderBy: {
                  order: 'asc'
                }
              },
              citations: {
                include: {
                  targetPaper: true
                }
              }
            }
          }
        }
      });

      return citations.map((citation: any) => this.mapToPaper(citation.sourcePaper));
    } catch (error) {
      throw new Error(`Failed to get cited by papers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addCitation(sourcePaperId: string, targetPaperId: string): Promise<void> {
    try {
      await this.prisma.citation.create({
        data: {
          sourcePaperId,
          targetPaperId,
          context: '', // Default empty context
          citationType: 'DIRECT'
        }
      });
    } catch (error) {
      throw new Error(`Failed to add citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeCitation(sourcePaperId: string, targetPaperId: string): Promise<void> {
    try {
      await this.prisma.citation.deleteMany({
        where: {
          sourcePaperId,
          targetPaperId
        }
      });
    } catch (error) {
      throw new Error(`Failed to remove citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCitationCount(paperId: string): Promise<number> {
    try {
      return await this.prisma.citation.count({
        where: { targetPaperId: paperId }
      });
    } catch (error) {
      throw new Error(`Failed to get citation count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCitationNetwork(paperId: string, _depth: number = 1): Promise<Paper[]> {
    try {
      // This is a simplified implementation
      // In a real scenario, you'd want to implement a proper graph traversal
      const citations = await this.prisma.citation.findMany({
        where: {
          OR: [
            { sourcePaperId: paperId },
            { targetPaperId: paperId }
          ]
        },
        include: {
          sourcePaper: {
            include: {
              authors: {
                include: {
                  author: true
                },
                orderBy: {
                  order: 'asc'
                }
              },
              citations: {
                include: {
                  targetPaper: true
                }
              }
            }
          },
          targetPaper: {
            include: {
              authors: {
                include: {
                  author: true
                },
                orderBy: {
                  order: 'asc'
                }
              },
              citations: {
                include: {
                  targetPaper: true
                }
              }
            }
          }
        }
      });

      const papers = new Set<Paper>();
      
      citations.forEach((citation: any) => {
        if (citation.sourcePaper.id !== paperId) {
          papers.add(this.mapToPaper(citation.sourcePaper));
        }
        if (citation.targetPaper.id !== paperId) {
          papers.add(this.mapToPaper(citation.targetPaper));
        }
      });

      return Array.from(papers);
    } catch (error) {
      throw new Error(`Failed to get citation network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToPaper(dbPaper: any): Paper {
    return {
      id: dbPaper.id,
      title: dbPaper.title,
      authors: dbPaper.authors.map((pa: any) => ({
        id: pa.author.id,
        name: pa.author.name,
        affiliation: pa.author.affiliation || undefined,
        email: pa.author.email || undefined
      })),
      abstract: dbPaper.abstract,
      keywords: dbPaper.keywords,
      publicationDate: dbPaper.publicationDate.toISOString().split('T')[0],
      journal: dbPaper.journal || undefined,
      conference: dbPaper.conference || undefined,
      doi: dbPaper.doi || undefined,
      url: dbPaper.url || undefined,
      filePath: dbPaper.filePath || undefined,
      citations: dbPaper.citations.map((c: any) => c.targetPaper.id),
      metadata: dbPaper.metadata || {},
      createdAt: dbPaper.createdAt.toISOString(),
      updatedAt: dbPaper.updatedAt.toISOString()
    };
  }
} 