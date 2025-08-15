
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Lock, Download, Star } from "lucide-react";
import { useState } from "react";
import AppDetailModal from "./AppDetailModal";

interface App {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon_url?: string;
  age_min: number;
  age_max: number;
  pegi_rating?: number;
  is_essential: boolean;
  is_mobile_compatible: boolean;
  hero_url?: string;
  description_long?: string;
  cross_platform_progress?: string;
}

interface InstalledApp {
  app_id: string;
  device_id: string;
  version: string;
}

interface AppGridProps {
  apps: App[];
  installedApps: InstalledApp[];
  isLoading: boolean;
  isAuthenticated: boolean;
  deviceContext: string;
}

export default function AppGrid({
  apps,
  installedApps,
  isLoading,
  isAuthenticated,
  deviceContext
}: AppGridProps) {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const isInstalled = (appId: string) => {
    return installedApps.some(installed => installed.app_id === appId);
  };

  const getAppStatus = (app: App) => {
    if (isInstalled(app.id)) {
      return { type: "installed", label: "On device", icon: Check };
    }
    
    if (!isAuthenticated) {
      return { type: "auth-required", label: "Request Install", icon: Lock };
    }
    
    // For demo purposes, assume some apps require approval
    const requiresApproval = app.pegi_rating && app.pegi_rating >= 12;
    if (requiresApproval) {
      return { type: "approval-required", label: "Request Install", icon: Lock };
    }
    
    return { type: "installable", label: "Install", icon: Download };
  };

  const handleAppAction = (app: App) => {
    const status = getAppStatus(app);
    
    if (status.type === "auth-required") {
      // Redirect to auth with return URL
      window.location.href = `/auth?return=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    
    if (status.type === "installable") {
      // Handle direct install
      console.log("Installing app:", app.id);
      // TODO: Implement installation logic
    }
    
    if (status.type === "approval-required") {
      // Create pending request
      console.log("Requesting approval for app:", app.id);
      // TODO: Implement approval request logic
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="w-16 h-16 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded mb-4" />
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apps.map((app) => {
          const status = getAppStatus(app);
          const StatusIcon = status.icon;

          return (
            <Card key={app.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                {/* App Icon and Info */}
                <div className="flex items-start gap-3 mb-4" onClick={() => setSelectedApp(app)}>
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {app.icon_url ? (
                      <img 
                        src={app.icon_url} 
                        alt={app.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary/20 rounded" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {app.description}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Ages {app.age_min}-{app.age_max}
                      </Badge>
                      {app.pegi_rating && (
                        <Badge variant="outline" className="text-xs">
                          PEGI {app.pegi_rating}
                        </Badge>
                      )}
                      {app.is_essential && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Essential
                        </Badge>
                      )}
                      {deviceContext === "mobile" && app.is_mobile_compatible && (
                        <Badge variant="secondary" className="text-xs">
                          Mobile-ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleAppAction(app)}
                  variant={status.type === "installed" ? "secondary" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={status.type === "installed"}
                >
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {status.label}
                  {status.type === "installed" && (
                    <Check className="w-4 h-4 ml-auto text-green-600" />
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* App Detail Modal */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          isAuthenticated={isAuthenticated}
          isInstalled={isInstalled(selectedApp.id)}
          deviceContext={deviceContext}
          onAction={() => handleAppAction(selectedApp)}
        />
      )}
    </>
  );
}
