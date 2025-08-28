import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import DevicesPage from "@/pages/DevicesPage";
import Account from "@/pages/Account";
import Children from "@/pages/Children";
import AdminDevices from "@/pages/admin/AdminDevices";
import AdminAppCatalog from "@/pages/admin/AdminAppCatalog";
import ChildApps from "@/pages/ChildApps";

const queryClient = new QueryClient();

export default function App() {
  const [_, __] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />

          {/* Protected */}
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
          {/* Child Apps console (both tabs share the same page component) */}
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

          {/* Admin */}
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
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}


