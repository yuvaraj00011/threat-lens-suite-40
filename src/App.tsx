import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/page" element={<Index />} />
          <Route path="/recent-files" element={<RecentFiles />} />
          <Route path="/case-history" element={<CaseHistory />} />
          <Route path="/report-center" element={<ReportCenter />} />
          <Route path="/starred-cases" element={<StarredCases />} />
          <Route path="/app-settings" element={<AppSettings />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/u-view" element={<UView />} />
          <Route path="/nila" element={<NilaAI />} />
          <Route path="/osint-finder" element={<OsintFinder />} />
          <Route path="/safe-documents" element={<SafeDocuments />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
