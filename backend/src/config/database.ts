import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
export const databaseConfig = {
  url: process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/scholar_weave',
  testUrl: process.env['TEST_DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/scholar_weave_test',
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  }
};

// Create Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['NODE_ENV'] === 'test' ? databaseConfig.testUrl : databaseConfig.url,
    },
  },
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Database connection management
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      await prisma.$connect();
      this.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  getPrismaClient(): PrismaClient {
    return prisma;
  }
}

// Export singleton instance
export const databaseConnection = DatabaseConnection.getInstance(); 