
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';
  
  // Disable demo mode for activation routes - they require real auth
  const isActivationRoute = location.pathname === '/activate' || location.pathname === '/device-activation';

  // Hard-disable demo mode if a real user exists or if on activation route
  if ((user && isDemoMode) || (isDemoMode && isActivationRoute)) {
    try { 
      localStorage.removeItem('demo-mode'); 
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user && (!isDemoMode || isActivationRoute)) {
    // Save the current location for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (!requireAuth && user && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
