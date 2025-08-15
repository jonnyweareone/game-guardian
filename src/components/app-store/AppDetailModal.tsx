
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Lock, Download, Star, Shield, Gamepad2, Palette } from "lucide-react";

interface App {
  id: string;
  name: string;
  description?: string;
  description_long?: string;
  category: string;
  icon_url?: string;
  hero_url?: string;
  age_min: number;
  age_max: number;
  pegi_rating?: number;
  is_essential: boolean;
  is_mobile_compatible: boolean;
  cross_platform_progress?: string;
  publisher?: string;
  website?: string;
}

interface AppDetailModalProps {
  app: App;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  isInstalled: boolean;
  deviceContext: string;
  onAction: () => void;
}

export default function AppDetailModal({
  app,
  isOpen,
  onClose,
  isAuthenticated,
  isInstalled,
  deviceContext,
  onAction
}: AppDetailModalProps) {
  const getActionButton = () => {
    if (isInstalled) {
      return (
        <Button variant="secondary" disabled className="w-full">
          <Check className="w-4 h-4 mr-2" />
          On device
        </Button>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <Button onClick={onAction} className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Sign in to Install
        </Button>
      );
    }
    
    const requiresApproval = app.pegi_rating && app.pegi_rating >= 12;
    
    return (
      <Button onClick={onAction} className="w-full">
        {requiresApproval ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Request Install
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Install
          </>
        )}
      </Button>
    );
  };

  const getCompatibilityBadges = () => {
    const badges = [];
    
    if (app.is_mobile_compatible) {
      badges.push(
        <Badge key="mobile" variant="secondary" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Mobile-ready
        </Badge>
      );
    }
    
    if (app.category === "Games") {
      badges.push(
        <Badge key="gamepad" variant="secondary" className="flex items-center gap-1">
          <Gamepad2 className="w-3 h-3" />
          Gamepad OK
        </Badge>
      );
    }
    
    if (app.category === "Creativity") {
      badges.push(
        <Badge key="creator" variant="secondary" className="flex items-center gap-1">
          <Palette className="w-3 h-3" />
          Creator-safe
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{app.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Hero Image */}
          {app.hero_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img 
                src={app.hero_url} 
                alt={app.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* App Info Header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
              {app.icon_url ? (
                <img 
                  src={app.icon_url} 
                  alt={app.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/20 rounded" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">
                  Ages {app.age_min}-{app.age_max}
                </Badge>
                {app.pegi_rating && (
                  <Badge variant="outline">
                    PEGI {app.pegi_rating}
                  </Badge>
                )}
                {app.is_essential && (
                  <Badge variant="default">
                    <Star className="w-3 h-3 mr-1" />
                    Essential
                  </Badge>
                )}
                <Badge variant="outline">{app.category}</Badge>
              </div>
              
              {app.publisher && (
                <p className="text-sm text-muted-foreground mb-2">
                  by {app.publisher}
                </p>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          {getActionButton()}
          
          <Separator />
          
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About this app</h3>
            <p className="text-muted-foreground">
              {app.description_long || app.description || "No description available."}
            </p>
          </div>
          
          {/* Compatibility */}
          <div>
            <h3 className="font-semibold mb-3">Compatibility</h3>
            <div className="flex flex-wrap gap-2">
              {getCompatibilityBadges()}
              {app.cross_platform_progress && (
                <Badge variant="outline">
                  {app.cross_platform_progress === 'cross-device' && 'Cross-Device'}
                  {app.cross_platform_progress === 'same-platform' && 'Same-Platform'}  
                  {app.cross_platform_progress === 'device-local' && 'Device-Local'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Additional Info */}
          {app.website && (
            <div>
              <h3 className="font-semibold mb-2">More Information</h3>
              <a 
                href={app.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit website
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
