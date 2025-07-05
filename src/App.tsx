import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import Dashboard from "./pages/Dashboard";
import Cours from "./pages/Cours";
import Etudiants from "./pages/Etudiants";
import Notes from "./pages/Notes";
import Parametres from "./pages/Parametres";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRouter() {
  useKeyboardShortcuts();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/cours" element={
        <ProtectedRoute>
          <AppLayout>
            <Cours />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/etudiants" element={
        <ProtectedRoute>
          <AppLayout>
            <Etudiants />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute>
          <AppLayout>
            <Notes />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parametres" element={
        <ProtectedRoute>
          <AppLayout>
            <Parametres />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <OfflineProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AppRouter />
                  </BrowserRouter>
                </TooltipProvider>
              </NotificationProvider>
            </OfflineProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
