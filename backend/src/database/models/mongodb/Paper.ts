import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperDocument extends Document {
  title: string;
  abstract: string;
  keywords: string[];
  publicationDate: Date;
  journal?: string;
  conference?: string;
  doi?: string;
  url?: string;
  filePath?: string;
  metadata?: any;
  authors?: Array<{
    name: string;
    email?: string;
    affiliation?: string;
    orcid?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PaperSchema = new Schema<IPaperDocument>({
  title: {
    type: String,
    required: true,
    index: true
  },
  abstract: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    index: true
  }],
  publicationDate: {
    type: Date,
    required: true,
    index: true
  },
  journal: {
    type: String,
    index: true
  },
  conference: {
    type: String,
    index: true
  },
  doi: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  url: String,
  filePath: String,
  authors: [{
    name: {
      type: String,
      required: true
    },
    email: String,
    affiliation: String,
    orcid: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'papers'
});

// Create indexes for better query performance
PaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
PaperSchema.index({ 'metadata.journal': 1 });
PaperSchema.index({ 'metadata.conference': 1 });

export const PaperModel = mongoose.model<IPaperDocument>('Paper', PaperSchema); 