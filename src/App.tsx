import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import AdminRoute from "@/components/AdminRoute";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import DevicesPage from "@/pages/DevicesPage";
import Account from "@/pages/Account";
import Children from "@/pages/Children";
import AdminDevices from "@/pages/admin/AdminDevices";
import AdminAppCatalog from "@/pages/admin/AdminAppCatalog";
import ChildApps from "@/pages/ChildApps";
import HomePage from "@/pages/HomePage";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Products from "@/pages/Products";
import HowToGuide from "@/pages/HowToGuide";
import DocsRoutes from "@/pages/docs/routes";
import Rewards from "@/pages/Rewards";
import Monitoring from "@/pages/Monitoring";
import Education from "@/pages/Education";
import OnlineSafetyLivestream from "@/pages/OnlineSafetyLivestream";

const queryClient = new QueryClient();

export default function App() {
  const [_, __] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
          <Route path="/reset" element={<AuthGuard requireAuth={false}><ResetPassword /></AuthGuard>} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/products" element={<Products />} />
          <Route path="/how-to-guide" element={<HowToGuide />} />
          
          {/* Public Event Page */}
          <Route path="/online-safety-livestream" element={<OnlineSafetyLivestream />} />
          
          {/* Docs Routes */}
          <Route path="/docs/*" element={<DocsRoutes />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/devices"
            element={
              <AuthGuard>
                <DevicesPage />
              </AuthGuard>
            }
          />
          <Route
            path="/account"
            element={
              <AuthGuard>
                <Account />
              </AuthGuard>
            }
          />
          <Route
            path="/children"
            element={
              <AuthGuard>
                <Children />
              </AuthGuard>
            }
          />
          
          {/* Child Apps Routes */}
          <Route
            path="/children/:childId/apps"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          <Route
            path="/children/:childId/apps/control"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          <Route
            path="/children/:childId/apps/store"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          
          {/* Additional Protected Routes */}
          <Route
            path="/monitoring"
            element={
              <AuthGuard>
                <Monitoring />
              </AuthGuard>
            }
          />
          <Route
            path="/education"
            element={
              <AuthGuard>
                <Education />
              </AuthGuard>
            }
          />
          <Route
            path="/rewards"
            element={
              <AuthGuard>
                <Rewards />
              </AuthGuard>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Navigate to="/admin/devices" replace /></AdminRoute>} />
          <Route
            path="/admin/devices"
            element={
              <AdminRoute>
                <AdminDevices />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/app-catalog"
            element={
              <AdminRoute>
                <AdminAppCatalog />
              </AdminRoute>
            }
          />
          
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}


