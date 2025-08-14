
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {navItems.map(({ to, page, requiresAuth, requiresAdmin }) => {
            let element = page;
            
            // Wrap admin routes with AdminRoute
            if (requiresAdmin) {
              element = <AdminRoute>{page}</AdminRoute>;
            }
            // Wrap protected routes with ProtectedRoute (but not admin routes as they handle their own auth)
            else if (requiresAuth) {
              element = <ProtectedRoute>{page}</ProtectedRoute>;
            }
            
            return <Route key={to} path={to} element={element} />;
          })}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
