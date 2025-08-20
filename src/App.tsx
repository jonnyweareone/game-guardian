
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import AdminRoute from "@/components/AdminRoute";
import DocsRoutes from "@/pages/docs/routes";
import Navigation from "@/components/Navigation";

// Import product detail pages
import ProductDevice from "./pages/ProductDevice";
import ProductOSMini from "./pages/ProductOSMini";
import ProductOSFull from "./pages/ProductOSFull";
import ProductReceiver from "./pages/ProductReceiver";

// Import admin components
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDevices from "./pages/admin/AdminDevices";
import AdminAppCatalog from "./pages/admin/AdminAppCatalog";
import AdminUIThemes from "./pages/admin/AdminUIThemes";
import AdminContentPush from "./pages/admin/AdminContentPush";
import AdminBooksIngest from "./pages/admin/AdminBooksIngest";
import OtaDemoLayout from "./pages/admin/ota-demo/OtaDemoLayout";
import OtaUpdateManager from "./pages/admin/ota-demo/OtaUpdateManager";
import OtaReports from "./pages/admin/ota-demo/OtaReports";
import TuxMathGame from './pages/games/TuxMath';
import BlocklyMazeGame from './pages/games/BlocklyMaze';
import TurtlestitchActivity from './pages/activities/Turtlestitch';
import BlocklyMaze from './pages/play/BlocklyMaze';
import Turtlestitch from './pages/play/Turtlestitch';
import TuxMath from './pages/play/TuxMath';
import Antura from './pages/play/Antura';

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
              
              {/* Nova Learning - public access for child tokens */}
              <Route path="/novalearning" element={
                navItems.find(item => item.to === "/novalearning")?.page
              } />
              
              {/* Nova Reader - public access for child tokens */}
              <Route path="/novalearning/reading/:bookId" element={
                navItems.find(item => item.to === "/novalearning/reading/:bookId")?.page
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
                .filter(item => !["/auth", "/", "/app-store", "/homework-helper", "/guardian-nova", "/novalearning", "/novalearning/reading/:bookId", "/admin", "/admin/waitlist"].includes(item.to))
                .map(({ to, page, title, requiresAuth = true, requiresAdmin = false }) => (
                  <Route
                    key={to}
                    path={to}
                    element={
                      <AuthGuard requireAuth={requiresAuth}>
                        {requiresAdmin ? (
                          <AdminRoute>
                            {page}
                          </AdminRoute>
                        ) : (
                          page
                        )}
                      </AuthGuard>
                    }
                  />
                ))}
              
              {/* Admin routes with nested routing */}
              <Route path="/admin" element={
                <AuthGuard requireAuth={true}>
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                </AuthGuard>
              }>
                <Route index element={<Navigate to="/admin/devices" replace />} />
                <Route path="devices" element={<AdminDevices />} />
                <Route path="app-catalog" element={<AdminAppCatalog />} />
                <Route path="ui-themes" element={<AdminUIThemes />} />
                <Route path="content-push" element={<AdminContentPush />} />
                <Route path="books" element={<AdminBooksIngest />} />
                <Route path="ota-demo" element={<OtaDemoLayout />}>
                  <Route index element={<Navigate to="/admin/ota-demo/manager" replace />} />
                  <Route path="manager" element={<OtaUpdateManager />} />
                  <Route path="reports" element={<OtaReports />} />
                </Route>
                <Route path="waitlist" element={
                  navItems.find(item => item.to === "/admin/waitlist")?.page
                } />
              </Route>
              
              {/* Product detail routes */}
              <Route path="/products/device" element={<ProductDevice />} />
              <Route path="/products/os-mini" element={<ProductOSMini />} />
              <Route path="/products/os-full" element={<ProductOSFull />} />
              <Route path="/products/receiver" element={<ProductReceiver />} />
              
              {/* Game and Activity routes - public access for tokens */}
              <Route path="/games/tuxmath" element={<TuxMathGame />} />
              <Route path="/games/blockly/maze" element={<BlocklyMazeGame />} />
              <Route path="/activities/turtlestitch" element={<TurtlestitchActivity />} />
              
              {/* New play routes for same-origin hosted games */}
              <Route path="/play/blockly/maze" element={<BlocklyMaze />} />
              <Route path="/play/turtlestitch" element={<Turtlestitch />} />
              <Route path="/play/tuxmath" element={<TuxMath />} />
              <Route path="/play/antura" element={<Antura />} />
              
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
