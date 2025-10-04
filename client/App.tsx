import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import JobsPage from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CandidatesPage from "./pages/Candidates";
import AssessmentsPage from "./pages/Assessments";
import CandidateDetail from "./pages/CandidateDetail";
import ResumeView from "./pages/ResumeView";
import Placeholder from "./pages/Placeholder";
import { makeServer } from "./mocks/mirage";

// Start MirageJS mock API
makeServer();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/resume/:id" element={<ResumeView />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/support" element={<Placeholder title="Support" />} />
            <Route path="/about" element={<Placeholder title="About Us" />} />
            <Route path="/contact" element={<Placeholder title="Contact Us" />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
