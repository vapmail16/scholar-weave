import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnotation {
  type: 'HIGHLIGHT' | 'COMMENT' | 'BOOKMARK';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content: string;
  color?: string;
}

export interface INoteDocument extends Document {
  paperId?: string;
  content: string;
  tags: string[];
  annotations: IAnnotation[];
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema = new Schema<IAnnotation>({
  type: {
    type: String,
    enum: ['HIGHLIGHT', 'COMMENT', 'BOOKMARK'],
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: Number,
    height: Number
  },
  content: {
    type: String,
    required: true
  },
  color: String
});

const NoteSchema = new Schema<INoteDocument>({
  paperId: {
    type: String,
    required: false,
    index: true
  },
  content: {
    type: String,
    required: true,
    index: 'text'
  },
  tags: [{
    type: String,
    index: true
  }],
  annotations: [AnnotationSchema]
}, {
  timestamps: true,
  collection: 'notes'
});

// Create indexes for better query performance
NoteSchema.index({ content: 'text', tags: 'text' });
NoteSchema.index({ paperId: 1, createdAt: -1 });

export const NoteModel = mongoose.model<INoteDocument>('Note', NoteSchema); 