import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Upload, Grid, List, SortAsc } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/common/ui/dialog";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import { api } from "@/services";
import { Paper } from "@/types/api";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"title" | "date" | "relevance" | "citations">("date");
  const [filterBy, setFilterBy] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: papersResponse, isLoading: isLoadingPapers, error, refetch } = useQuery({
    queryKey: ["papers", { search: searchQuery, sort: sortBy }],
    queryFn: () => api.papers.getPapers({
      query: searchQuery,
      sortBy,
      page: 1,
      limit: 20
    }),
    enabled: true, // Enable now that backend is ready
  });

  const papers = papersResponse?.data || [];

  const handleImportPaper = () => {
    setIsUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      console.log("Uploading file:", selectedFile.name);
      
      // For now, we'll create a paper with the file metadata
      // In a real implementation, you'd parse the PDF and extract metadata
      const paperData = {
        title: selectedFile.name.replace('.pdf', ''),
        abstract: `Paper imported from file: ${selectedFile.name}`,
        authors: [{ name: "Unknown Author" }],
        keywords: ["imported", "pdf"],
        publicationDate: new Date().toISOString().split('T')[0],
        journal: "Imported Paper",
        doi: `imported-${Date.now()}`,
        url: "",
        citations: [],
        metadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          importDate: new Date().toISOString()
        }
      };

      await api.papers.createPaper(paperData);
      console.log("Paper imported successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      refetch(); // Refresh the papers list
    } catch (error) {
      console.error("Failed to import paper:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setIsUploadDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const PaperCard = ({ paper }: { paper: Paper }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
          <Badge variant="secondary">{paper.publicationDate?.split('-')[0]}</Badge>
        </div>
        <CardDescription className="line-clamp-1">
          {paper.authors && paper.authors.length > 0 
            ? paper.authors.map(a => a.name).join(", ")
            : "Unknown Author"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {paper.abstract}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {paper.keywords.slice(0, 3).map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {paper.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{paper.keywords.length - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{paper.journal || paper.conference}</span>
          <span>{paper.citations?.length || 0} citations</span>
        </div>
      </CardContent>
    </Card>
  );

  const PaperListItem = ({ paper }: { paper: Paper }) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1 mb-1">{paper.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {paper.authors && paper.authors.length > 0 
                ? paper.authors.map(a => a.name).join(", ")
                : "Unknown Author"
              }
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {paper.abstract}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">{paper.publicationDate?.split('-')[0]}</Badge>
            <span className="text-xs text-muted-foreground">
              {paper.citations?.length || 0} citations
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paper Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage and explore your research papers
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleImportPaper} className="gap-2">
              <Upload className="h-4 w-4" />
              Import Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Research Paper</DialogTitle>
              <DialogDescription>
                Upload a PDF file or enter paper details manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload PDF</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Supported formats: PDF</p>
                <p>Maximum file size: 10MB</p>
              </div>
              {isLoading && (
                <div className="text-sm text-blue-600">
                  Uploading paper...
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelUpload}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isLoading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Paper
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search papers by title, author, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Publication Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="citations">Citations</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Papers List */}
      {isLoadingPapers ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading papers...</div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No papers found</h3>
          <p className="text-muted-foreground mb-4">
            Start by importing your first paper
          </p>
          <Button onClick={handleImportPaper} className="gap-2">
            <Upload className="h-4 w-4" />
            Import Your First Paper
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {papers.map((paper) => (
            viewMode === "grid" ? (
              <PaperCard key={paper.id} paper={paper} />
            ) : (
              <PaperListItem key={paper.id} paper={paper} />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;