import { useState, useEffect } from "react";
import { Database, Check, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Progress } from "@/components/common/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { migrationAPI, MigrationProgress } from "@/services/migration-api";

type DatabaseType = "mongodb" | "postgres" | "hybrid";

interface DatabaseStatus {
  type: DatabaseType;
  status: "connected" | "disconnected";
}

const DatabaseToggle = () => {
  const [currentDb, setCurrentDb] = useState<DatabaseStatus>({
    type: "mongodb",
    status: "disconnected"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const { toast } = useToast();

  // Fetch current database status
  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/health");
      const data = await response.json();
      setCurrentDb({
        type: data.database.type as DatabaseType,
        status: data.database.status as "connected" | "disconnected"
      });
    } catch (error) {
      console.error("Failed to fetch database status:", error);
      setCurrentDb({
        type: "mongodb",
        status: "disconnected"
      });
    }
  };

  // Switch database with migration
  const switchDatabase = async () => {
    if (isLoading) return;
    
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
      // Determine target database based on current
      let targetDb: 'mongodb' | 'postgres';
      if (currentDb.type === 'mongodb' || currentDb.type === 'hybrid') {
        targetDb = 'postgres';
      } else {
        targetDb = 'mongodb';
      }

      const result = await migrationAPI.switchDatabase(currentDb.type as 'mongodb' | 'postgres', targetDb);
      
      if (result.success) {
        toast({
          title: "Database Switched",
          description: `Successfully switched to ${targetDb.toUpperCase()}`,
        });
        
        // Update current database status
        setCurrentDb({
          type: targetDb,
          status: "connected"
        });
        
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Switch Failed",
        description: "Failed to switch database. Please try again.",
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
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    return status === "connected" ? "bg-green-500" : "bg-red-500";
  };

  const getDbIcon = (type: DatabaseType) => {
    if (type === "mongodb") return "🍃";
    if (type === "postgres") return "🐘";
    return "🔄"; // hybrid
  };

  const getDbName = (type: DatabaseType) => {
    if (type === "mongodb") return "MongoDB";
    if (type === "postgres") return "PostgreSQL";
    return "Hybrid";
  };

  const getDbColor = (type: DatabaseType) => {
    if (type === "mongodb") return "text-green-600";
    if (type === "postgres") return "text-blue-600";
    return "text-purple-600";
  };

  const getNextDbName = (currentType: DatabaseType) => {
    if (currentType === "mongodb" || currentType === "hybrid") return "PostgreSQL";
    return "MongoDB";
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg shadow-sm">
      {/* Database Status Pill */}
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1.5 px-3 py-2 ${
          currentDb.status === "connected" 
            ? "border-green-500 text-green-700 bg-green-50" 
            : "border-red-500 text-red-700 bg-red-50"
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor(currentDb.status)} animate-pulse`} />
        <span className="text-sm">{getDbIcon(currentDb.type)}</span>
        <span className={`text-sm font-semibold ${getDbColor(currentDb.type)}`}>
          {getDbName(currentDb.type)}
        </span>
        {currentDb.status === "connected" && <Check className="w-3 h-3 text-green-600" />}
      </Badge>

      {/* Switch Database Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={switchDatabase}
        disabled={isLoading || migrationProgress.status === 'migrating'}
        className="h-8 px-3 text-xs transition-all duration-200 hover:bg-muted-foreground/20"
      >
        {isLoading || migrationProgress.status === 'migrating' ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <ArrowRightLeft className="w-3 h-3 mr-1" />
        )}
        Switch to {getNextDbName(currentDb.type)}
      </Button>

      {/* Migration Progress Bar */}
      {migrationProgress.status === 'migrating' && (
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{migrationProgress.currentStep}</span>
            <span>{migrationProgress.progress}%</span>
          </div>
          <Progress value={migrationProgress.progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {migrationProgress.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseToggle; 