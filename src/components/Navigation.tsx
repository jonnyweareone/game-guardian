import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    // Check for demo mode on component mount
    const demoMode = localStorage.getItem('demo-mode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    // Redirect to auth page after sign out
    navigate('/auth');
  };

  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      localStorage.removeItem('demo-mode');
      setIsDemoMode(false);
      toast({
        title: "Demo mode disabled",
        description: "You're back to the real world!",
      })
    } else {
      localStorage.setItem('demo-mode', 'true');
      setIsDemoMode(true);
      toast({
        title: "Demo mode enabled",
        description: "Welcome to the demo! All changes are temporary.",
      })
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/guardian-logo-transparent.png" 
                alt="Guardian AI" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-gray-900">Guardian AI</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard-v2"
                  className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Dashboard V2
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </Link>
                {isDemoMode && (
                  <Badge variant="destructive">Demo Mode</Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center ml-4 md:ml-6">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                      <AvatarFallback>{user.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    {user.user_metadata?.full_name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleDemoMode}>
                    {isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              location.pathname !== '/auth' && (
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
