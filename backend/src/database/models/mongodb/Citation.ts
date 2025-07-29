import mongoose, { Schema, Document } from 'mongoose';

export interface ICitationDocument extends Document {
  sourcePaperId: string;
  targetPaperId: string;
  context: string;
  citationType: 'DIRECT' | 'INDIRECT' | 'SUPPORTIVE' | 'CRITICAL' | 'BACKGROUND';
  pageNumber?: number;
  createdAt: Date;
}

const CitationSchema = new Schema<ICitationDocument>({
  sourcePaperId: {
    type: String,
    required: true,
    index: true
  },
  targetPaperId: {
    type: String,
    required: true,
    index: true
  },
  context: {
    type: String,
    required: true
  },
  citationType: {
    type: String,
    enum: ['DIRECT', 'INDIRECT', 'SUPPORTIVE', 'CRITICAL', 'BACKGROUND'],
    required: true,
    index: true
  },
  pageNumber: Number
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'citations'
});

// Create compound unique index for paper pair
CitationSchema.index({ sourcePaperId: 1, targetPaperId: 1 }, { unique: true });

// Create indexes for better query performance
CitationSchema.index({ sourcePaperId: 1, citationType: 1 });
CitationSchema.index({ targetPaperId: 1, citationType: 1 });

export const CitationModel = mongoose.model<ICitationDocument>('Citation', CitationSchema); 