import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Search, Network, FileText, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { api } from "@/services";
import { Citation } from "@/types/api";

const Citations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [citationType, setCitationType] = useState<"direct" | "indirect" | "supportive" | "critical" | "background" | "all">("all");

  const { data: citationsResponse, isLoading } = useQuery({
    queryKey: ["citations", { search: searchQuery, type: citationType }],
    queryFn: () => api.citations.searchCitations({
      context: searchQuery,
      citationType: citationType !== "all" ? citationType as Citation['citationType'] : undefined,
      page: 1,
      limit: 50
    }),
    enabled: false, // Disable until backend is ready
  });

  const { data: graphData } = useQuery({
    queryKey: ["citation-graph", selectedPaperId],
    queryFn: () => selectedPaperId ? api.citations.getCitationGraph(selectedPaperId) : null,
    enabled: false, // Disable until backend is ready
  });

  const citations = citationsResponse?.data || [];

  const CitationCard = ({ citation }: { citation: Citation }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">
              Citation Relationship
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <GitBranch className="h-3 w-3" />
              {citation.citationType || "Direct"} citation
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            ID: {citation.id.slice(0, 8)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Context:</p>
            <p className="text-sm line-clamp-3">
              {citation.context || "No context available"}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Source: {citation.sourcePaperId.slice(0, 8)}...</span>
            <span>Target: {citation.targetPaperId.slice(0, 8)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CitationNetworkView = () => (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Citation Network Graph
        </CardTitle>
        <CardDescription>
          Interactive visualization of citation relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        {selectedPaperId ? (
          <div className="text-center">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Citation network for paper: {selectedPaperId.slice(0, 8)}...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Interactive graph visualization would be rendered here
            </p>
          </div>
        ) : (
          <div className="text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a paper to view its citation network
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CitationAnalytics = () => {
    const totalCitations = citations.length;
    const uniqueSources = new Set(citations.map(c => c.sourcePaperId)).size;
    const uniqueTargets = new Set(citations.map(c => c.targetPaperId)).size;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCitations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all papers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Citing Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{uniqueSources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique source papers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cited Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{uniqueTargets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique target papers
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citation Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Explore relationships between research papers
          </p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Analytics Overview */}
      <CitationAnalytics />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search citations by context or paper..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={citationType} onValueChange={(value) => setCitationType(value as typeof citationType)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Citation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="indirect">Indirect</SelectItem>
                <SelectItem value="supportive">Supportive</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Paper ID for network view"
              value={selectedPaperId || ""}
              onChange={(e) => setSelectedPaperId(e.target.value || null)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="citations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="citations">Citation List</TabsTrigger>
          <TabsTrigger value="network">Network View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="citations" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : citations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No citations found</h3>
                <p className="text-muted-foreground">
                  Import papers to start building your citation network
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {citations.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="network">
          <CitationNetworkView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Citations;