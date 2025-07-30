import { useState, useEffect } from "react";
import { Database, Check, Loader2, ArrowRightLeft, FileText, StickyNote, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Progress } from "@/components/common/ui/progress";
import { Card, CardContent } from "@/components/common/ui/card";
import { useToast } from "@/hooks/use-toast";
import { migrationAPI, MigrationProgress } from "@/services/migration-api";
import { useQueryClient } from "@tanstack/react-query";

type DatabaseType = "mongodb" | "postgres";

interface DatabaseStatus {
  type: DatabaseType;
  status: "connected" | "disconnected";
}

interface DatabaseStats {
  mongodb: {
    papers: number;
    notes: number;
    status: "connected" | "disconnected";
  };
  postgres: {
    papers: number;
    notes: number;
    status: "connected" | "disconnected";
  };
}

const DatabaseToggle = () => {
  const [writeDatabase, setWriteDatabase] = useState<DatabaseType>("mongodb");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    mongodb: { papers: 0, notes: 0, status: "disconnected" },
    postgres: { papers: 0, notes: 0, status: "disconnected" }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current database status and stats
  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch("http://localhost:3002/health");
      const data = await response.json();
      setWriteDatabase(data.database.type as DatabaseType);
      
      // Update status for current database
      const currentDb = data.database.type as DatabaseType;
      setDatabaseStats(prev => ({
        ...prev,
        [currentDb]: {
          ...prev[currentDb],
          status: data.database.status as "connected" | "disconnected"
        }
      }));
    } catch (error) {
      console.error("Failed to fetch database status:", error);
    }
  };

  // Fetch document counts for both databases
  const fetchDatabaseStats = async () => {
    setIsRefreshing(true);
    try {
      // Fetch stats for MongoDB
      const mongoResponse = await fetch("http://localhost:3002/api/database/stats?type=mongodb");
      const mongoData = await mongoResponse.json();
      
      // Fetch stats for PostgreSQL
      const postgresResponse = await fetch("http://localhost:3002/api/database/stats?type=postgres");
      const postgresData = await postgresResponse.json();

      setDatabaseStats({
        mongodb: {
          papers: mongoData.papers || 0,
          notes: mongoData.notes || 0,
          status: mongoData.status || "disconnected"
        },
        postgres: {
          papers: postgresData.papers || 0,
          notes: postgresData.notes || 0,
          status: postgresData.status || "disconnected"
        }
      });
      
      // Also invalidate queries to ensure fresh data
      await queryClient.invalidateQueries();
    } catch (error) {
      console.error("Failed to fetch database stats:", error);
      toast({
        title: "Stats Update Failed",
        description: "Could not fetch database statistics",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Switch write database (no migration)
  const switchWriteDatabase = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const targetDb: DatabaseType = writeDatabase === "mongodb" ? "postgres" : "mongodb";

    try {
      const response = await fetch("http://localhost:3002/api/database/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseType: targetDb }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setWriteDatabase(targetDb);
        toast({
          title: "Write Database Changed",
          description: `Now writing to ${targetDb.toUpperCase()}`,
        });
        
        // Invalidate all queries to refresh data from new database
        await queryClient.invalidateQueries();
        
        // Update status
        await fetchDatabaseStatus();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Switch Failed",
        description: "Failed to switch write database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate data between databases
  const migrateData = async () => {
    if (isLoading || migrationProgress.status === 'migrating') return;
    
    setIsLoading(true);
    setMigrationProgress({
      status: 'migrating',
      progress: 0,
      message: 'Starting migration...'
    });

    // Set up progress callback
    migrationAPI.setProgressCallback((progress) => {
      setMigrationProgress(progress);
    });

    try {
      const result = await migrationAPI.migrateData(writeDatabase, writeDatabase === "mongodb" ? "postgres" : "mongodb");
      
      if (result.success) {
        toast({
          title: "Migration Complete",
          description: `Successfully migrated data to ${writeDatabase === "mongodb" ? "PostgreSQL" : "MongoDB"}`,
        });
        
        // Invalidate all queries to refresh data
        await queryClient.invalidateQueries();
        
        // Refresh stats after migration
        await fetchDatabaseStats();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: "Failed to migrate data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setMigrationProgress({
          status: 'idle',
          progress: 0,
          message: ''
        });
      }, 2000);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
    fetchDatabaseStats();
    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      fetchDatabaseStatus();
      fetchDatabaseStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getDbIcon = (type: DatabaseType) => {
    return type === "mongodb" ? "🍃" : "🐘";
  };

  const getDbName = (type: DatabaseType) => {
    return type === "mongodb" ? "MongoDB" : "PostgreSQL";
  };

  const getDbColor = (type: DatabaseType) => {
    return type === "mongodb" ? "text-green-600" : "text-blue-600";
  };

  const getStatusColor = (status: string) => {
    return status === "connected" ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-6">
          
          {/* 1. Write Database */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Write:</span>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                databaseStats[writeDatabase].status === "connected" 
                  ? "border-green-500 text-green-700 bg-green-50" 
                  : "border-red-500 text-red-700 bg-red-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(databaseStats[writeDatabase].status)} animate-pulse`} />
              <span className="text-sm">{getDbIcon(writeDatabase)}</span>
              <span className={`text-sm font-semibold ${getDbColor(writeDatabase)}`}>
                {getDbName(writeDatabase)}
              </span>
              {databaseStats[writeDatabase].status === "connected" && <Check className="w-3 h-3 text-green-600" />}
            </Badge>
          </div>

          {/* 2. Switch Database */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={switchWriteDatabase}
              disabled={isLoading}
              className="h-8 px-3 text-xs transition-all duration-200 hover:bg-blue-50 border-blue-200"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <ArrowRightLeft className="w-3 h-3 mr-1" />
              )}
              Switch to {writeDatabase === "mongodb" ? "PostgreSQL" : "MongoDB"}
            </Button>
          </div>

          {/* 3. Migrate Data */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={migrateData}
              disabled={isLoading || migrationProgress.status === 'migrating'}
              className="h-8 px-3 text-xs transition-all duration-200 hover:bg-purple-50 border-purple-200"
            >
              {isLoading || migrationProgress.status === 'migrating' ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <ArrowRightLeft className="w-3 h-3 mr-1" />
              )}
              Migrate to other DB
            </Button>
          </div>

          {/* 4. Statistics */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Stats:</span>
            
            {/* MongoDB Stats */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getDbIcon("mongodb")}</span>
              <span className="text-xs text-gray-600">
                <FileText className="w-3 h-3 inline mr-1" />
                {databaseStats.mongodb.papers}
              </span>
              <span className="text-xs text-gray-600">
                <StickyNote className="w-3 h-3 inline mr-1" />
                {databaseStats.mongodb.notes}
              </span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(databaseStats.mongodb.status)}`} />
            </div>

            {/* PostgreSQL Stats */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getDbIcon("postgres")}</span>
              <span className="text-xs text-gray-600">
                <FileText className="w-3 h-3 inline mr-1" />
                {databaseStats.postgres.papers}
              </span>
              <span className="text-xs text-gray-600">
                <StickyNote className="w-3 h-3 inline mr-1" />
                {databaseStats.postgres.notes}
              </span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(databaseStats.postgres.status)}`} />
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDatabaseStats}
              disabled={isRefreshing}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Migration Progress Bar - Full Width */}
        {migrationProgress.status === 'migrating' && (
          <div className="mt-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{migrationProgress.currentStep}</span>
              <span>{migrationProgress.progress}%</span>
            </div>
            <Progress value={migrationProgress.progress} className="h-2" />
            <div className="text-xs text-gray-600 mt-1 text-center">
              {migrationProgress.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseToggle; 