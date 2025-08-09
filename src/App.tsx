import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DeviceActivation from "./pages/DeviceActivation";
import Products from "./pages/Products";
import ProductDevice from "./pages/ProductDevice";
import ProductOSMini from "./pages/ProductOSMini";
import ProductOSFull from "./pages/ProductOSFull";
import ProductReceiver from "./pages/ProductReceiver";
import Blog from "./pages/Blog";
import BlogPost from "./components/BlogPost";
import PressReleases from "./pages/PressReleases";
import HowToGuide from "./pages/HowToGuide";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/activate" element={<DeviceActivation />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/security" element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            } />
            
            {/* Product Pages */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/device" element={<ProductDevice />} />
            <Route path="/products/os-mini" element={<ProductOSMini />} />
            <Route path="/products/os-full" element={<ProductOSFull />} />
            <Route path="/products/receiver" element={<ProductReceiver />} />
            
            {/* Content Pages */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/press-releases" element={<PressReleases />} />
            <Route path="/how-to-guide" element={<HowToGuide />} />
            <Route path="/about" element={<About />} />
            
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
