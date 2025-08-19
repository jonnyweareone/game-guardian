
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import DocsRoutes from "@/pages/docs/routes";
import Navigation from "@/components/Navigation";

// Import product detail pages
import ProductDevice from "./pages/ProductDevice";
import ProductOSMini from "./pages/ProductOSMini";
import ProductOSFull from "./pages/ProductOSFull";
import ProductReceiver from "./pages/ProductReceiver";

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
              
              {/* Home route - now properly mapped to / */}
              <Route path="/" element={
                navItems.find(item => item.to === "/")?.page
              } />
              
              {/* Index redirect */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              
              {/* Guardian Nova - public access */}
              <Route path="/guardian-nova" element={
                navItems.find(item => item.to === "/guardian-nova")?.page
              } />
              
              {/* Homework Helper - public access */}
              <Route path="/homework-helper" element={
                navItems.find(item => item.to === "/homework-helper")?.page
              } />
              
              {/* Docs section - public access */}
              <Route path="/docs/*" element={<DocsRoutes />} />
              
              {/* App Store - accessible to both authenticated and public users */}
              <Route path="/app-store" element={
                navItems.find(item => item.to === "/app-store")?.page
              } />
              
              {/* Protected routes */}
              {navItems
                .filter(item => !["/auth", "/", "/app-store", "/homework-helper", "/guardian-nova"].includes(item.to))
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
              
              {/* Product detail routes */}
              <Route path="/products/device" element={<ProductDevice />} />
              <Route path="/products/os-mini" element={<ProductOSMini />} />
              <Route path="/products/os-full" element={<ProductOSFull />} />
              <Route path="/products/receiver" element={<ProductReceiver />} />
              
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
