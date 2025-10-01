import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Medical from "./pages/Medical";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/residents" element={<DashboardLayout><Residents /></DashboardLayout>} />
          <Route path="/medical" element={<DashboardLayout><Medical /></DashboardLayout>} />
          <Route path="/documents" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/accounting" element={<DashboardLayout><div className="text-center text-muted-foreground py-12">Accounting module coming soon</div></DashboardLayout>} />
          <Route path="/hr" element={<DashboardLayout><div className="text-center text-muted-foreground py-12">HR module coming soon</div></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><div className="text-center text-muted-foreground py-12">Reports module coming soon</div></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
