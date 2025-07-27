-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_papers_abstract ON papers USING gin(to_tsvector('english', abstract));
CREATE INDEX IF NOT EXISTS idx_papers_keywords ON papers USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_papers_publication_date ON papers(publication_date);
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi) WHERE doi IS NOT NULL;

-- Create indexes for authors
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email) WHERE email IS NOT NULL;

-- Create indexes for citations
CREATE INDEX IF NOT EXISTS idx_citations_source ON citations(source_paper_id);
CREATE INDEX IF NOT EXISTS idx_citations_target ON citations(target_paper_id);
CREATE INDEX IF NOT EXISTS idx_citations_pair ON citations(source_paper_id, target_paper_id);

-- Create indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_paper_id ON notes(paper_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);

-- Create indexes for annotations
CREATE INDEX IF NOT EXISTS idx_annotations_note_id ON annotations(note_id);
CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type); 