import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavigationProps {
  transparent?: boolean;
}

const Navigation = ({ transparent = false }: NavigationProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className={`${transparent ? 'bg-transparent' : 'bg-card/50 backdrop-blur-sm border-b border-border'} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Game Guardian AI™</h1>
              <p className="text-xs text-muted-foreground">Intelligent Gaming Protection</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate('/products')}>Products</Button>
            <Button variant="ghost" onClick={() => navigate('/how-to-guide')}>How-to Guide</Button>
            <Button variant="ghost" onClick={() => navigate('/blog')}>Blog</Button>
            <Button variant="ghost" onClick={() => navigate('/about')}>About</Button>
            <Button variant="ghost" onClick={() => navigate('/security')}>Security</Button>
            <Button variant="ghost" onClick={() => navigate('/pitch-deck')}>Pitch Deck</Button>
          </nav>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <Avatar>
                      <AvatarFallback>{(user.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm text-foreground">{user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/security')}>Security</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/ota-demo')}>OTA Demo</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;