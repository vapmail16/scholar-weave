import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB configuration
export const mongodbConfig = {
  uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/scholar_weave',
  testUri: process.env['TEST_MONGODB_URI'] || 'mongodb://localhost:27017/scholar_weave_test',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  } as mongoose.ConnectOptions
};

// MongoDB connection management
export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      const uri = process.env['NODE_ENV'] === 'test' ? mongodbConfig.testUri : mongodbConfig.uri;
      await mongoose.connect(uri, mongodbConfig.options);
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ MongoDB disconnection failed:', error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }

  getMongoose(): typeof mongoose {
    return mongoose;
  }
}

// Export singleton instance
export const mongodbConnection = MongoDBConnection.getInstance(); 