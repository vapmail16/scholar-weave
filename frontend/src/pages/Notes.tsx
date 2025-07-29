import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Tag, Calendar, FileText, Edit } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/common/ui/dialog";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import { api } from "@/services";
import { Note } from "@/types/api";

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "updatedAt" | "createdAt">("updatedAt");
  const [filterTag, setFilterTag] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: notesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["notes", { search: searchQuery, sort: sortBy, tag: filterTag }],
    queryFn: () => api.notes.getNotes({
      query: searchQuery,
      sortBy,
      tags: filterTag !== "all" ? [filterTag] : undefined,
      page: 1,
      limit: 50
    }),
    enabled: true, // Enable now that backend is ready
  });

  const notes = notesResponse?.data || [];

  // Extract unique tags for filtering
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const handleCreateNote = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsCreating(true);
    try {
      const tags = newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const noteData = {
        content: newNoteContent,
        tags: tags,
        paperId: undefined, // Not linked to any paper
        annotations: []
      };
      
      await api.notes.createNote(noteData);
      console.log("Note created successfully!");
      
      // Reset form
      setNewNoteContent("");
      setNewNoteTags("");
      setIsCreateDialogOpen(false);
      
      // Refresh the notes list
      refetch();
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const NoteCard = ({ note }: { note: Note }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {note.content.split('\n')[0].slice(0, 50) || "Untitled Note"}
          </CardTitle>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        {note.paperId && (
          <CardDescription className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Linked to paper
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
          {note.content}
        </p>
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{note.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(note.updatedAt)}
          </span>
          <span>{note.annotations?.length || 0} annotations</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Research Notes</h1>
          <p className="text-muted-foreground mt-1">
            Organize your thoughts and insights
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNote} className="gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a new research note with your thoughts and insights.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter your research notes here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={6}
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                <Input
                  id="note-tags"
                  placeholder="research, insights, ideas"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              {isCreating && (
                <div className="text-sm text-blue-600">
                  Creating note...
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNote}
                  disabled={!newNoteContent.trim() || isCreating}
                >
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes by content or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading notes...</div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first research note
          </p>
          <Button onClick={handleCreateNote} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;