import { useState } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthGuard } from "@/components/AuthGuard"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AdminRoute } from "@/components/AdminRoute"
import { Navigation } from "@/components/Navigation"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import DashboardV2 from "@/pages/DashboardV2"
import Account from "@/pages/Account"
import Children from "@/pages/Children"
import ChildDetail from "@/pages/ChildDetail"
import Devices from "@/pages/Devices"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminDevices from "@/pages/admin/AdminDevices"
import AdminAppCatalog from "@/pages/admin/AdminAppCatalog"
import ChildApps from "@/pages/ChildApps"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClient client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthGuard><DashboardV2 /></AuthGuard>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
          <Route path="/children/:childId" element={<ProtectedRoute><ChildDetail /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/devices" element={<AdminRoute><AdminDevices /></AdminRoute>} />
          <Route path="/admin/app-catalog" element={<AdminRoute><AdminAppCatalog /></AdminRoute>} />
          
          {/* Child Apps Management */}
          <Route path="/children/:childId/apps" element={<ProtectedRoute><ChildApps /></ProtectedRoute>} />
          <Route path="/children/:childId/apps/control" element={<ProtectedRoute><ChildApps /></ProtectedRoute>} />
          <Route path="/children/:childId/apps/store" element={<ProtectedRoute><ChildApps /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
