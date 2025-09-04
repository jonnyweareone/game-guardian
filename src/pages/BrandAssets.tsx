
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Copy, Check, Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const [copiedWget, setCopiedWget] = useState<string | null>(null);
  const [assetStatus, setAssetStatus] = useState<Record<string, 'loading' | 'available' | 'unavailable'>>({});
  const [domainMode, setDomainMode] = useState<'current' | 'lovable'>('current');
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
      size: "~150KB"
    },
    {
      title: "Shield + Text Logo (Transparent)",
      description: "Complete brand logo with shield icon and text layout - transparent background",
      image: logoShieldTextTransparent,
      filename: "guardian-logo-shield-text-transparent.png",
      dimensions: "1024×512",
      size: "~200KB"
    },
    {
      title: "Shield + Text Logo (Dark Preview)",
      description: "Complete brand logo with shield icon and text on dark background",
      image: logoShieldTextDark,
      filename: "guardian-logo-shield-text-dark.png",
      dimensions: "1024×512",
      size: "~180KB"
    },
    {
      title: "Shield + Text Logo (Interactive)",
      description: "Interactive React component version - downloads as PNG with transparent background",
      component: <GuardianLogoComponent />,
      filename: "guardian-logo-shield-text-interactive.png",
      dimensions: "1024×512",
      size: "Generated",
      isComponent: true
    },
    {
      title: "Legacy Logo 2",
      description: "Previous shield + text layout version",
      image: logo2Transparent,
      filename: "game-guardian-logo2-transparent.png",
      dimensions: "800×200",
      size: "~120KB"
    },
    {
      title: "Splash Screen",
      description: "Loading screen design with dark gradient background",
      image: splashScreen,
      filename: "game-guardian-splash.png",
      dimensions: "1920×1080",
      size: "~800KB"
    },
    {
      title: "Desktop Wallpaper",
      description: "Desktop background with gaming aesthetic",
      image: wallpaperDesktop,
      filename: "game-guardian-wallpaper-desktop.png",
      dimensions: "1920×1080",
      size: "~1.2MB"
    },
    {
      title: "Mobile Wallpaper",
      description: "Vertical wallpaper optimized for mobile devices",
      image: wallpaperMobile,
      filename: "game-guardian-wallpaper-mobile.png",
      dimensions: "1080×1920",
      size: "~900KB"
    }
  ];

  // Check asset availability on mount with improved fallback
  useEffect(() => {
    const checkAssets = async () => {
      const nonComponentAssets = assets.filter(asset => !asset.isComponent);
      
      for (const asset of nonComponentAssets) {
        if (!asset.image) continue;
        
        setAssetStatus(prev => ({ ...prev, [asset.image!]: 'loading' }));
        
        try {
          // Try HEAD request first
          const response = await fetch(asset.image, { method: 'HEAD' });
          if (response.ok) {
            setAssetStatus(prev => ({ ...prev, [asset.image!]: 'available' }));
            continue;
          }
        } catch {}
        
        try {
          // Fallback: Try loading image element
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = asset.image!;
          });
          setAssetStatus(prev => ({ ...prev, [asset.image!]: 'available' }));
        } catch {
          setAssetStatus(prev => ({ ...prev, [asset.image!]: 'unavailable' }));
        }
      }
    };
    
    checkAssets();
  }, []);

  // Unified URL generation for all actions
  const getAssetUrl = (assetPath: string) => {
    const currentDomain = window.location.origin;
    const lovableDomain = "https://game-guardian.lovable.app";
    
    return domainMode === 'current' ? `${currentDomain}${assetPath}` : `${lovableDomain}${assetPath}`;
  };

  const getFallbackUrl = (assetPath: string) => {
    return `https://game-guardian.lovable.app${assetPath}`;
  };

  const copyAllWgetCommands = async () => {
    const nonComponentAssets = assets.filter(asset => !asset.isComponent && asset.image);
    const commands = nonComponentAssets.map(asset => `wget ${getAssetUrl(asset.image!)}`).join('\n');
    
    try {
      await navigator.clipboard.writeText(commands);
      toast.success("All wget commands copied!");
    } catch {
      toast.error("Failed to copy wget commands");
    }
  };

  const openAssetUrl = (assetPath: string) => {
    window.open(getAssetUrl(assetPath), '_blank');
  };

  const getStatusIcon = (assetPath: string) => {
    const status = assetStatus[assetPath];
    switch (status) {
      case 'loading': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'available': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unavailable': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (assetPath: string) => {
    const status = assetStatus[assetPath];
    switch (status) {
      case 'loading': return <Badge variant="secondary">Checking...</Badge>;
      case 'available': return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'unavailable': return <Badge variant="destructive">404 Error</Badge>;
      default: return null;
    }
  };

  const copyToClipboard = async (assetPath: string) => {
    const url = getAssetUrl(assetPath);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const copyWgetCommand = async (assetPath: string) => {
    const wgetCommand = `wget ${getAssetUrl(assetPath)}`;
    try {
      await navigator.clipboard.writeText(wgetCommand);
      setCopiedWget(assetPath);
      toast.success("wget command copied!");
      setTimeout(() => setCopiedWget(null), 2000);
    } catch (err) {
      toast.error("Failed to copy wget command");
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

            {/* Publish Reminder Alert */}
            <Alert className="mb-8">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Having 404 issues?</strong> Make sure to <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => window.open('/publish', '_blank')}>Publish your project</Button> first. 
                Assets may not be available on custom domains until the latest build is published.
              </AlertDescription>
            </Alert>

            {/* Asset Status & Controls Panel */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Asset Status & Controls
                  <div className="flex gap-2">
                    <Button
                      variant={domainMode === 'current' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDomainMode('current')}
                    >
                      Current Domain
                    </Button>
                    <Button
                      variant={domainMode === 'lovable' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDomainMode('lovable')}
                    >
                      Lovable.app
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Check asset availability and copy all wget commands at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {assets.filter(asset => !asset.isComponent).map((asset, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {getStatusIcon(asset.image!)}
                      <span className="text-sm">{asset.title}</span>
                      {getStatusBadge(asset.image!)}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyAllWgetCommands} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All wget Commands
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      <div className="flex items-center gap-2">
                        {asset.title}
                        {!asset.isComponent && getStatusIcon(asset.image!)}
                      </div>
                      <div className="text-sm font-normal text-muted-foreground">
                        <div>{asset.dimensions}</div>
                        <div>{asset.size}</div>
                      </div>
                    </CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>{asset.description}</span>
                      {!asset.isComponent && getStatusBadge(asset.image!)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!asset.isComponent && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/30">
                        <span className="font-medium">Resolved URL:</span> {getAssetUrl(asset.image!)}
                        {assetStatus[asset.image!] === 'unavailable' && domainMode === 'current' && (
                          <div className="mt-1">
                            <span className="text-amber-600">Fallback:</span>{" "}
                            <button 
                              onClick={() => copyToClipboard(getFallbackUrl(asset.image!))}
                              className="text-blue-600 hover:underline"
                            >
                              {getFallbackUrl(asset.image!)}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
                          onClick={() => copyToClipboard(asset.image!)}
                          className="flex-1"
                        >
                          {copiedUrl === getAssetUrl(asset.image!) ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Copy URL
                        </Button>
                      )}
                    </div>
                    {!asset.isComponent && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyWgetCommand(asset.image!)}
                          className="flex-1"
                        >
                          {copiedWget === asset.image ? (
                            <Check className="w-3 h-3 mr-2" />
                          ) : (
                            <Copy className="w-3 h-3 mr-2" />
                          )}
                          Copy wget
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssetUrl(asset.image!)}
                          className="flex-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Open URL
                        </Button>
                      </div>
                    )}
                    {asset.isComponent && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Interactive component - Downloads as PNG with transparent background
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-4">CLI Download Commands</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">wget commands for all assets:</h3>
                  <div className="space-y-1 text-sm text-muted-foreground font-mono">
                    <div>wget {getAssetUrl(logoTransparent)}</div>
                    <div>wget {getAssetUrl(logoShieldTextTransparent)}</div>
                    <div>wget {getAssetUrl(logoShieldTextDark)}</div>
                    <div>wget {getAssetUrl(logo2Transparent)}</div>
                    <div>wget {getAssetUrl(splashScreen)}</div>
                    <div>wget {getAssetUrl(wallpaperDesktop)}</div>
                    <div>wget {getAssetUrl(wallpaperMobile)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Usage Guidelines:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use "Copy wget" buttons above for individual download commands</li>
                    <li>• URLs are automatically updated based on your current domain</li>
                    <li>• All logos have transparent backgrounds for versatile use</li>
                    <li>• Shield + Text logos are the current official brand identity</li>
                    <li>• Splash screen is optimized for app loading screens</li>
                    <li>• Wallpapers are available in both desktop and mobile formats</li>
                    <li>• Maintain aspect ratios when resizing images</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandAssets;
