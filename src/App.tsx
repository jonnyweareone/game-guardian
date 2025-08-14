
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
            <Routes>
              {/* Routes with Navigation */}
              <Route path="/" element={
                <div>
                  <Navigation />
                  <HomePage />
                </div>
              } />
              <Route path="/auth" element={
                <div>
                  <Navigation />
                  <Auth />
                </div>
              } />
              <Route path="/reset-password" element={
                <div>
                  <Navigation />
                  <ResetPassword />
                </div>
              } />
              <Route path="/activate" element={
                <div>
                  <Navigation />
                  <DeviceActivation />
                </div>
              } />
              <Route path="/about" element={
                <div>
                  <Navigation />
                  <About />
                </div>
              } />
              <Route path="/blog" element={
                <div>
                  <Navigation />
                  <Blog />
                </div>
              } />
              <Route path="/how-to-guide" element={
                <div>
                  <Navigation />
                  <HowToGuide />
                </div>
              } />
              <Route path="/products" element={
                <div>
                  <Navigation />
                  <Products />
                </div>
              } />
              <Route path="/products/device" element={
                <div>
                  <Navigation />
                  <ProductDevice />
                </div>
              } />
              <Route path="/products/os-full" element={
                <div>
                  <Navigation />
                  <ProductOSFull />
                </div>
              } />
              <Route path="/products/receiver" element={
                <div>
                  <Navigation />
                  <ProductReceiver />
                </div>
              } />
              <Route path="/creator-mode" element={
                <div>
                  <Navigation />
                  <CreatorMode />
                </div>
              } />
              <Route path="/press-releases" element={
                <div>
                  <Navigation />
                  <PressReleases />
                </div>
              } />
              
              {/* Protected Routes with Navigation */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div>
                    <Navigation />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/dashboard-v2" element={
                <ProtectedRoute>
                  <div>
                    <Navigation />
                    <DashboardV2 />
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - NO Navigation (they have their own headers) */}
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
              
              {/* OTA Demo Routes - NO Navigation (they have their own headers) */}
              <Route path="/admin/ota-demo" element={
                <ProtectedRoute>
                  <OtaDemoLayout />
                </ProtectedRoute>
              }>
                <Route index element={<OtaUpdateManager />} />
                <Route path="reports" element={<OtaReports />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={
                <div>
                  <Navigation />
                  <NotFound />
                </div>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
