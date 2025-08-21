import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  this.setState({ errorInfo });
}

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                The application encountered an unexpected error. Please try refreshing the page or return to Nova Learning.
              </p>
              
              {this.state.error && (
<details className="text-left mb-6 p-4 bg-muted rounded-lg">
  <summary className="cursor-pointer font-medium">Error details</summary>
  <div className="mt-2 space-y-3">
    <div>
      <div className="text-xs uppercase text-muted-foreground mb-1">Message</div>
      <pre className="text-sm overflow-auto">{this.state.error.message}</pre>
    </div>
    {this.state.errorInfo?.componentStack && (
      <div>
        <div className="text-xs uppercase text-muted-foreground mb-1">Component stack</div>
        <pre className="text-xs overflow-auto whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
      </div>
    )}
  </div>
</details>
              )}

              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => {
                    const token = sessionStorage.getItem('nova_token');
                    const url = token ? `/novalearning?token=${token}` : '/';
                    window.location.href = url;
                  }}
                >
                  Back to Nova Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}