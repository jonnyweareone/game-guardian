import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

interface NavigationProps {
  transparent?: boolean;
}

const Navigation = ({ transparent = false }: NavigationProps) => {
  const navigate = useNavigate();

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
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;