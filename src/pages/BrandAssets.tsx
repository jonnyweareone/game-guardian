
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Use the original brand assets from public/branding folder
const logoTransparent = "/branding/logo-transparent.png";
const splashScreen = "/branding/splash-screen.png";
const wallpaperDesktop = "/branding/wallpaper-desktop.png";
const wallpaperMobile = "/branding/wallpaper-mobile.png";

const BrandAssets = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Component for the new logo2
  const Logo2Component = () => (
    <div className="flex items-center gap-3 bg-background p-8 rounded-lg">
      <Shield className="h-16 w-16 text-primary" />
      <div>
        <h1 className="text-3xl font-bold text-foreground">Game Guardian AI™</h1>
        <p className="text-lg text-muted-foreground">Intelligent Gaming Protection</p>
      </div>
    </div>
  );

  const assets = [
    {
      title: "Logo (Transparent)",
      description: "High-resolution logo with transparent background",
      image: logoTransparent,
      filename: "game-guardian-logo-transparent.png",
      dimensions: "1024×512"
    },
    {
      title: "Logo 2 (Shield + Text)",
      description: "Complete brand logo with shield icon and text layout",
      component: <Logo2Component />,
      filename: "game-guardian-logo2.png",
      dimensions: "Custom",
      isComponent: true
    },
    {
      title: "Splash Screen",
      description: "Loading screen design with dark gradient background",
      image: splashScreen,
      filename: "game-guardian-splash.png",
      dimensions: "1920×1080"
    },
    {
      title: "Desktop Wallpaper",
      description: "Desktop background with gaming aesthetic",
      image: wallpaperDesktop,
      filename: "game-guardian-wallpaper-desktop.png",
      dimensions: "1920×1080"
    },
    {
      title: "Mobile Wallpaper",
      description: "Vertical wallpaper optimized for mobile devices",
      image: wallpaperMobile,
      filename: "game-guardian-wallpaper-mobile.png",
      dimensions: "1080×1920"
    }
  ];

  const getFullUrl = (assetPath: string) => {
    return `${window.location.origin}${assetPath}`;
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const downloadImage = (assetPath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = assetPath;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadComponent = (filename: string) => {
    // Create a canvas to convert the component to an image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 200;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Note: This is a simplified version. For production, you'd want to use html2canvas or similar
    toast.info("Component download feature coming soon!");
  };

  return (
    <>
      <SEOHead 
        title="Brand Assets - Game Guardian AI™"
        description="Download official Game Guardian AI™ logos, splash screens, and wallpapers. High-resolution brand assets for marketing and promotional use."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Game Guardian AI™ Brand Assets
              </h1>
              <p className="text-xl text-muted-foreground">
                Official logos, splash screens, and wallpapers for download
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {assets.map((asset, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center p-4">
                    {asset.isComponent ? (
                      asset.component
                    ) : (
                      <img 
                        src={asset.image} 
                        alt={asset.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {asset.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        {asset.dimensions}
                      </span>
                    </CardTitle>
                    <CardDescription>{asset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => asset.isComponent 
                          ? downloadComponent(asset.filename) 
                          : downloadImage(asset.image!, asset.filename)
                        }
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {!asset.isComponent && (
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(getFullUrl(asset.image!))}
                          className="flex-1"
                        >
                          {copiedUrl === getFullUrl(asset.image!) ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Copy URL
                        </Button>
                      )}
                    </div>
                    {!asset.isComponent && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground break-all">
                          {getFullUrl(asset.image!)}
                        </p>
                      </div>
                    )}
                    {asset.isComponent && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          React component - Shield icon with brand text layout
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Usage Guidelines</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• These assets are official Game Guardian AI™ brand materials</li>
                <li>• Use the transparent logo for overlay on various backgrounds</li>
                <li>• Logo 2 provides the complete brand identity with shield and text</li>
                <li>• Splash screen is optimized for app loading screens</li>
                <li>• Wallpapers are available in both desktop and mobile formats</li>
                <li>• Maintain aspect ratios when resizing images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandAssets;
