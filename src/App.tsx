
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useEffect } from 'react';
import HomePage from '@/pages/HomePage';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import DashboardV2 from '@/pages/DashboardV2';
import DeviceActivation from '@/pages/DeviceActivation';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import HowToGuide from '@/pages/HowToGuide';
import Products from '@/pages/Products';
import ProductDevice from '@/pages/ProductDevice';
import ProductOSFull from '@/pages/ProductOSFull';
import ProductReceiver from '@/pages/ProductReceiver';
import CreatorMode from '@/pages/CreatorMode';
import PressReleases from '@/pages/PressReleases';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDevices from '@/pages/admin/AdminDevices';
import AdminAppCatalog from '@/pages/admin/AdminAppCatalog';
import AdminUIThemes from '@/pages/admin/AdminUIThemes';
import AdminContentPush from '@/pages/admin/AdminContentPush';
import OtaDemoLayout from '@/pages/admin/ota-demo/OtaDemoLayout';
import OtaUpdateManager from '@/pages/admin/ota-demo/OtaUpdateManager';
import OtaReports from '@/pages/admin/ota-demo/OtaReports';
import NotFound from '@/pages/NotFound';
import Navigation from '@/components/Navigation';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Component to conditionally render navigation
const ConditionalNavigation = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Don't render main navigation on admin routes as they have their own headers
  if (isAdminRoute) {
    return null;
  }
  
  return <Navigation />;
};

function App() {
  // Clean up demo mode on mount
  useEffect(() => {
    if (window.location.pathname !== '/auth') {
      try { localStorage.removeItem('demo-mode'); } catch {}
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <ConditionalNavigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/activate" element={<DeviceActivation />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/how-to-guide" element={<HowToGuide />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/device" element={<ProductDevice />} />
              <Route path="/products/os-full" element={<ProductOSFull />} />
              <Route path="/products/receiver" element={<ProductReceiver />} />
              <Route path="/creator-mode" element={<CreatorMode />} />
              <Route path="/press-releases" element={<PressReleases />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard-v2" element={
                <ProtectedRoute>
                  <DashboardV2 />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/devices" replace />} />
                <Route path="devices" element={<AdminDevices />} />
                <Route path="app-catalog" element={<AdminAppCatalog />} />
                <Route path="ui-themes" element={<AdminUIThemes />} />
                <Route path="content-push" element={<AdminContentPush />} />
              </Route>
              
              {/* OTA Demo Routes */}
              <Route path="/admin/ota-demo" element={
                <ProtectedRoute>
                  <OtaDemoLayout />
                </ProtectedRoute>
              }>
                <Route index element={<OtaUpdateManager />} />
                <Route path="reports" element={<OtaReports />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
