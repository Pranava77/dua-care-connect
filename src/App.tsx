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
import Accounting from "./pages/Accounting";
import HR from "./pages/HR";
import Reports from "./pages/Reports";
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
          <Route path="/accounting" element={<DashboardLayout><Accounting /></DashboardLayout>} />
          <Route path="/hr" element={<DashboardLayout><HR /></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
