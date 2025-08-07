import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const notFoundStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Not Found - Game Guardian AI",
    "description": "The page you are looking for could not be found.",
    "url": `https://gameguardianai.com${location.pathname}`
  };

  return (
    <>
      <SEOHead
        title="Page Not Found (404) - Game Guardian AI™"
        description="The page you are looking for could not be found. Return to our homepage to explore Game Guardian AI's gaming safety features."
        canonicalUrl="https://gameguardianai.com/404"
        structuredData={notFoundStructuredData}
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <header className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-16 w-16 text-primary" aria-label="Game Guardian AI logo" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </header>
          
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <a href="/" aria-label="Return to Game Guardian AI homepage">
              <Home className="mr-2 h-5 w-5" aria-hidden="true" />
              Return to Home
            </a>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
