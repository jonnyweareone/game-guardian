
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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
            <Navigation />
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
              <Route path="*" element={
                <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold">Page Not Found</h1>
                  <p>Sorry, the page you are looking for does not exist.</p>
                  <Link to="/" className="text-blue-500">Go Home</Link>
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
