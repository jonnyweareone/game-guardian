
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Shield } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

// Use the correct brand assets from public/lovable-uploads folder
const logoTransparent = "/lovable-uploads/guardian-logo-transparent.png";
const logo2Transparent = "/lovable-uploads/guardian-logo2-transparent.png";
const logoShieldTextTransparent = "/lovable-uploads/guardian-logo-shield-text-transparent.png";
const logoShieldTextDark = "/lovable-uploads/guardian-logo-shield-text-dark.png";
const splashScreen = "/lovable-uploads/guardian-splash-screen.png";
const wallpaperDesktop = "/lovable-uploads/guardian-wallpaper-desktop.png";
const wallpaperMobile = "/lovable-uploads/guardian-wallpaper-mobile.png";

const BrandAssets = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Enhanced logo component with shield and text
  const GuardianLogoComponent = () => (
    <div ref={logoRef} className="flex items-center gap-4 bg-transparent p-8 rounded-lg" style={{ width: '1024px', height: '512px' }}>
      <div className="relative">
        <Shield className="h-32 w-32 text-blue-600 fill-blue-100" strokeWidth={1.5} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full opacity-30"></div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="text-6xl font-bold text-gray-900 tracking-tight">Game Guardian AI™</h1>
        <p className="text-3xl text-blue-600 font-medium mt-2">Intelligent Gaming Protection</p>
      </div>
    </div>
  );

  const assets = [
    {
      title: "Logo (Original Transparent)",
      description: "Original high-resolution logo with transparent background",
      image: logoTransparent,
      filename: "game-guardian-logo-transparent.png",
      dimensions: "1024×512",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-logo-transparent.png"
    },
    {
      title: "Shield + Text Logo (Transparent)",
      description: "Complete brand logo with shield icon and text layout - transparent background",
      image: logoShieldTextTransparent,
      filename: "guardian-logo-shield-text-transparent.png",
      dimensions: "1024×512",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-transparent.png"
    },
    {
      title: "Shield + Text Logo (Dark Preview)",
      description: "Complete brand logo with shield icon and text on dark background",
      image: logoShieldTextDark,
      filename: "guardian-logo-shield-text-dark.png",
      dimensions: "1024×512",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-dark.png"
    },
    {
      title: "Shield + Text Logo (Interactive)",
      description: "Interactive React component version - downloads as PNG with transparent background",
      component: <GuardianLogoComponent />,
      filename: "guardian-logo-shield-text-interactive.png",
      dimensions: "1024×512",
      isComponent: true
    },
    {
      title: "Legacy Logo 2",
      description: "Previous shield + text layout version",
      image: logo2Transparent,
      filename: "game-guardian-logo2-transparent.png",
      dimensions: "800×200",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-logo2-transparent.png"
    },
    {
      title: "Splash Screen",
      description: "Loading screen design with dark gradient background",
      image: splashScreen,
      filename: "game-guardian-splash.png",
      dimensions: "1920×1080",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-splash-screen.png"
    },
    {
      title: "Desktop Wallpaper",
      description: "Desktop background with gaming aesthetic",
      image: wallpaperDesktop,
      filename: "game-guardian-wallpaper-desktop.png",
      dimensions: "1920×1080",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-wallpaper-desktop.png"
    },
    {
      title: "Mobile Wallpaper",
      description: "Vertical wallpaper optimized for mobile devices",
      image: wallpaperMobile,
      filename: "game-guardian-wallpaper-mobile.png",
      dimensions: "1080×1920",
      wgetUrl: "https://gameguardian.ai/lovable-uploads/guardian-wallpaper-mobile.png"
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

  const downloadComponent = async (filename: string) => {
    if (!logoRef.current) return;
    
    try {
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: null, // transparent background
        scale: 2,
        width: 1024,
        height: 512,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Logo downloaded successfully!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Failed to download logo");
    }
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
                    {!asset.isComponent && asset.wgetUrl && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">wget URL:</p>
                        <p className="text-sm text-muted-foreground break-all font-mono">
                          {asset.wgetUrl}
                        </p>
                      </div>
                    )}
                    {asset.isComponent && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Interactive component - Downloads as PNG with transparent background (1024×512)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Usage Guidelines & wget URLs</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Direct wget URLs for all assets:</h3>
                  <div className="space-y-1 text-sm text-muted-foreground font-mono">
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-logo-transparent.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-transparent.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-logo-shield-text-dark.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-logo2-transparent.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-splash-screen.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-wallpaper-desktop.png</div>
                    <div>wget https://gameguardian.ai/lovable-uploads/guardian-wallpaper-mobile.png</div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• These assets are official Game Guardian AI™ brand materials</li>
                  <li>• Use the transparent logo for overlay on various backgrounds</li>
                  <li>• Logo 2 is available both as a static PNG and interactive component</li>
                  <li>• All logos have transparent backgrounds for versatile use</li>
                  <li>• Splash screen is optimized for app loading screens</li>
                  <li>• Wallpapers are available in both desktop and mobile formats</li>
                  <li>• Maintain aspect ratios when resizing images</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandAssets;
