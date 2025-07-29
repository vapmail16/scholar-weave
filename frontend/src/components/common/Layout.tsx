import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Library, FileText, GitBranch, Settings, User } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { useToast } from "@/hooks/use-toast";
import DatabaseToggle from "@/components/features/DatabaseToggle";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const navItems = [
    { icon: Library, label: "Dashboard", path: "/" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: FileText, label: "Notes", path: "/notes" },
    { icon: GitBranch, label: "Citations", path: "/citations" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleImportPaper = () => {
    toast({
      title: "Import Paper",
      description: "Import functionality will be available when backend is connected.",
    });
  };

  const handleNewNote = () => {
    navigate("/notes");
    toast({
      title: "Create Note",
      description: "Note creation will be available when backend is connected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-primary">ScholarWeave</h1>
            
            {/* Search Bar */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search papers, notes, citations..."
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DatabaseToggle />
            <Button variant="outline" size="sm" onClick={handleImportPaper}>
              Import Paper
            </Button>
            <Button size="sm" onClick={handleNewNote}>
              New Note
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-border bg-card p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;