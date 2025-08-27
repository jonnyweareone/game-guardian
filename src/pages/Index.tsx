
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Temporary test - show visible content instead of redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Routing Test - Index Page Loaded</h1>
        <p className="text-muted-foreground">If you can see this, routing is working</p>
        <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
      </div>
    </div>
  );
};

export default Index;
