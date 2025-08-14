
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Navigation from "./components/Navigation";

// Import product detail pages
import ProductDevice from "./pages/ProductDevice";
import ProductOSMini from "./pages/ProductOSMini";
import ProductOSFull from "./pages/ProductOSFull";
import ProductReceiver from "./pages/ProductReceiver";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          {/* Product detail routes */}
          <Route path="/products/device" element={<ProductDevice />} />
          <Route path="/products/os-mini" element={<ProductOSMini />} />
          <Route path="/products/os-full" element={<ProductOSFull />} />
          <Route path="/products/receiver" element={<ProductReceiver />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
