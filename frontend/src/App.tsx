import { Toaster } from "@/components/common/ui/toaster";
import { Toaster as Sonner } from "@/components/common/ui/sonner";
import { TooltipProvider } from "@/components/common/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/common/Layout";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import Notes from "@/pages/Notes";
import Citations from "@/pages/Citations";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/citations" element={<Citations />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
