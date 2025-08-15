
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppGrid from "@/components/app-store/AppGrid";
import AppSearch from "@/components/app-store/AppSearch";
import CategoryFilters from "@/components/app-store/CategoryFilters";
import DeviceSelector from "@/components/app-store/DeviceSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AppStore() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deviceContext, setDeviceContext] = useState(searchParams.get("device") || "desktop");

  // Detect device context from user agent if not specified
  useEffect(() => {
    if (!searchParams.get("device")) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const detectedDevice = isMobile ? "mobile" : "desktop";
      setDeviceContext(detectedDevice);
      setSearchParams({ device: detectedDevice });
    }
  }, [searchParams, setSearchParams]);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['app-catalog', deviceContext, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('app_catalog')
        .select('*')
        .eq('is_active', true);

      // Filter by device compatibility
      if (deviceContext === 'mobile') {
        query = query.eq('is_mobile_compatible', true);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: installedApps } = useQuery({
    queryKey: ['installed-apps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('installed_apps')
        .select('app_id, device_id, version')
        .in('device_id', [/* Get user's devices */]);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredApps = apps?.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Games", "Education", "Creativity", "Utilities", "Communication", "Entertainment"];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guardian OS App Store</h1>
          <p className="text-muted-foreground">
            {user 
              ? "Discover and install apps for your Guardian devices"
              : "Browse our curated collection of family-safe applications"
            }
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <AppSearch 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              <DeviceSelector 
                deviceContext={deviceContext}
                onDeviceChange={setDeviceContext}
              />
            </div>
            
            <Separator className="my-4" />
            
            <CategoryFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </CardContent>
        </Card>

        {/* App Grid */}
        <AppGrid 
          apps={filteredApps || []}
          installedApps={installedApps || []}
          isLoading={isLoading}
          isAuthenticated={!!user}
          deviceContext={deviceContext}
        />
      </div>
    </div>
  );
}
