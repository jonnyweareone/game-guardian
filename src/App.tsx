
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={
                <AuthGuard requireAuth={false}>
                  {navItems.find(item => item.to === "/auth")?.page}
                </AuthGuard>
              } />
              
              {/* Home route */}
              <Route path="/" element={<HomePage />} />
              <Route path="/index" element={<Navigate to="/" replace />} />
              
              {/* Protected routes */}
              {navItems
                .filter(item => item.to !== "/auth")
                .map(({ to, page, title, requiresAuth = true, requiresAdmin = false }) => (
                  <Route
                    key={to}
                    path={to}
                    element={
                      <AuthGuard requireAuth={requiresAuth}>
                        {requiresAdmin ? (
                          <AuthGuard requireAuth={true}>
                            {page}
                          </AuthGuard>
                        ) : (
                          page
                        )}
                      </AuthGuard>
                    }
                  />
                ))}
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
