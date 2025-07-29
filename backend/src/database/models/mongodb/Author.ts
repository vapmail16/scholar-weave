import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthorDocument extends Document {
  name: string;
  affiliation?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthorDocument>({
  name: {
    type: String,
    required: true,
    index: true
  },
  affiliation: {
    type: String,
    index: true
  },
  email: {
    type: String,
    index: true
  }
}, {
  timestamps: true,
  collection: 'authors'
});

// Create indexes for better query performance
AuthorSchema.index({ name: 'text', affiliation: 'text' });

export const AuthorModel = mongoose.model<IAuthorDocument>('Author', AuthorSchema); 