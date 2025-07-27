import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RecentFiles from "./pages/RecentFiles";
import CaseHistory from "./pages/CaseHistory";
import ReportCenter from "./pages/ReportCenter";
import StarredCases from "./pages/StarredCases";
import AppSettings from "./pages/AppSettings";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";
import OsintFinder from "./pages/OsintFinder";
import SafeDocuments from "./pages/SafeDocuments";
import NilaAI from "./pages/NilaAI";
import UView from "./pages/UView";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/page" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/recent-files" element={<AuthGuard><RecentFiles /></AuthGuard>} />
          <Route path="/case-history" element={<AuthGuard><CaseHistory /></AuthGuard>} />
          <Route path="/report-center" element={<AuthGuard requireRole="investigator"><ReportCenter /></AuthGuard>} />
          <Route path="/starred-cases" element={<AuthGuard><StarredCases /></AuthGuard>} />
          <Route path="/app-settings" element={<AuthGuard requireRole="admin"><AppSettings /></AuthGuard>} />
          <Route path="/my-profile" element={<AuthGuard><MyProfile /></AuthGuard>} />
          <Route path="/u-view" element={<AuthGuard><UView /></AuthGuard>} />
          <Route path="/nila" element={<AuthGuard><NilaAI /></AuthGuard>} />
          <Route path="/osint-finder" element={<AuthGuard><OsintFinder /></AuthGuard>} />
          <Route path="/safe-documents" element={<AuthGuard><SafeDocuments /></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
