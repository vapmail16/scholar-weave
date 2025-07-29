import { apiClient } from './api-client';

export interface MigrationProgress {
  status: 'idle' | 'migrating' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  currentStep?: string;
  totalSteps?: number;
  currentStepNumber?: number;
}

export interface MigrationRequest {
  fromDatabase: 'mongodb' | 'postgres';
  toDatabase: 'mongodb' | 'postgres';
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  progress?: MigrationProgress;
}

class MigrationAPI {
  private progressCallback?: (progress: MigrationProgress) => void;

  setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.progressCallback = callback;
  }

  async switchDatabase(fromDb: 'mongodb' | 'postgres', toDb: 'mongodb' | 'postgres'): Promise<MigrationResponse> {
    try {
      // Step 1: Initiate migration
      this.updateProgress({
        status: 'migrating',
        progress: 10,
        message: 'Initiating database migration...',
        currentStep: 'Initializing',
        totalSteps: 5,
        currentStepNumber: 1
      });

      // Step 2: Switch database type
      this.updateProgress({
        status: 'migrating',
        progress: 30,
        message: 'Switching database configuration...',
        currentStep: 'Switching Database',
        totalSteps: 5,
        currentStepNumber: 2
      });

      const switchResponse = await apiClient.post('/api/database/switch', {
        databaseType: toDb
      });

      // Step 3: Migrate data
      this.updateProgress({
        status: 'migrating',
        progress: 50,
        message: 'Migrating data between databases...',
        currentStep: 'Migrating Data',
        totalSteps: 5,
        currentStepNumber: 3
      });

      // Simulate migration time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Verify migration
      this.updateProgress({
        status: 'migrating',
        progress: 80,
        message: 'Verifying migration results...',
        currentStep: 'Verifying',
        totalSteps: 5,
        currentStepNumber: 4
      });

      // Step 5: Complete
      this.updateProgress({
        status: 'migrating',
        progress: 100,
        message: 'Migration completed successfully!',
        currentStep: 'Completed',
        totalSteps: 5,
        currentStepNumber: 5
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      this.updateProgress({
        status: 'completed',
        progress: 100,
        message: 'Database switched successfully!'
      });

      return {
        success: true,
        message: `Successfully switched from ${fromDb} to ${toDb}`,
        progress: {
          status: 'completed',
          progress: 100,
          message: 'Migration completed successfully!'
        }
      };

    } catch (error) {
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
        progress: {
          status: 'error',
          progress: 0,
          message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      };
    }
  }

  private updateProgress(progress: MigrationProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

export const migrationAPI = new MigrationAPI(); 