import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Residents = lazy(() => import("./pages/Residents"));
const Medical = lazy(() => import("./pages/Medical"));
const About = lazy(() => import("./pages/About"));
const DocumentLibrary = lazy(() => import("./pages/DocumentLibrary"));
const Accounting = lazy(() => import("./pages/Accounting"));
const HR = lazy(() => import("./pages/HR"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const ResidentDetails = lazy(() => import("./pages/ResidentDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route path="/login" element={
        user ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Login />
        )
      } />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute><DashboardLayout><Residents /></DashboardLayout></ProtectedRoute>} />
      <Route path="/residents/:id" element={<ProtectedRoute><DashboardLayout><ResidentDetails /></DashboardLayout></ProtectedRoute>} />
      <Route path="/medical" element={<ProtectedRoute><DashboardLayout><Medical /></DashboardLayout></ProtectedRoute>} />
      <Route path="/about" element={<About />} />
      <Route path="/documents" element={<ProtectedRoute><DashboardLayout><DocumentLibrary /></DashboardLayout></ProtectedRoute>} />
      <Route path="/accounting" element={<ProtectedRoute><DashboardLayout><Accounting /></DashboardLayout></ProtectedRoute>} />
      <Route path="/hr" element={<ProtectedRoute><DashboardLayout><HR /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
};

export default App;
