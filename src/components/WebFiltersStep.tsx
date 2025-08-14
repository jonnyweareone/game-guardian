
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Clock, CheckCircle, Info, ShieldCheck } from 'lucide-react';

interface WebFilterConfig {
  schoolHoursEnabled: boolean;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

interface WebFiltersStepProps {
  webFilterConfig: WebFilterConfig;
  onWebFilterConfigChange: (config: WebFilterConfig) => void;
  childName: string;
  childAge?: number;
}

export function WebFiltersStep({ 
  webFilterConfig, 
  onWebFilterConfigChange, 
  childName,
  childAge = 8 
}: WebFiltersStepProps) {
  const handleToggle = (key: keyof WebFilterConfig, value: boolean) => {
    onWebFilterConfigChange({
      ...webFilterConfig,
      [key]: value
    });
  };

  const automaticProtections = [
    'Adult Content',
    'Violence & Weapons',
    'Terrorism & Extremism', 
    'Drugs & Alcohol'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          Web Filters & Protection
        </h3>
        <p className="text-sm text-muted-foreground">
          Guardian AI will automatically create age-appropriate web filtering for {childName}.
        </p>
      </div>

      {/* Automatic Protection Box */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-green-800">
            <ShieldCheck className="h-4 w-4" />
            Automatic Protection Active
          </CardTitle>
          <CardDescription className="text-green-700">
            These categories have been automatically removed to safeguard {childName}:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {automaticProtections.map((protection) => (
              <div key={protection} className="flex items-center gap-2 text-sm text-green-700">
                <Shield className="h-3 w-3" />
                <span>{protection}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safe Search Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <CheckCircle className="h-4 w-4" />
            Safe Search Enabled
          </CardTitle>
          <CardDescription className="text-blue-700">
            Safe Search is automatically enabled across all search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <p>Filters explicit content from search results on Google, Bing, YouTube, and other platforms to ensure {childName} sees age-appropriate content.</p>
        </CardContent>
      </Card>

      {/* Configurable Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Content Controls</CardTitle>
          <CardDescription>
            Choose additional categories to filter based on {childName}'s age and your family preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
              <div className="space-y-1">
                <Label htmlFor="social-media">Social Media Platforms</Label>
                <p className="text-sm text-muted-foreground">
                  Block access to social media during device use (Recommended for ages under 13)
                </p>
              </div>
              <Switch
                id="social-media"
                checked={webFilterConfig.socialMediaBlocked}
                onCheckedChange={(checked) => handleToggle('socialMediaBlocked', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
              <div className="space-y-1">
                <Label htmlFor="gaming">Gaming Platforms</Label>
                <p className="text-sm text-muted-foreground">
                  Block web-based gaming sites and platforms (Age-appropriate filtering applied)
                </p>
              </div>
              <Switch
                id="gaming"
                checked={webFilterConfig.gamingBlocked}
                onCheckedChange={(checked) => handleToggle('gamingBlocked', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
              <div className="space-y-1">
                <Label htmlFor="entertainment">Entertainment & Streaming</Label>
                <p className="text-sm text-muted-foreground">
                  Filter content based on age ratings and family-friendly guidelines
                </p>
              </div>
              <Switch
                id="entertainment"
                checked={webFilterConfig.entertainmentBlocked}
                onCheckedChange={(checked) => handleToggle('entertainmentBlocked', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Hours Protection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            School Hours Protection
          </CardTitle>
          <CardDescription>
            Enhanced filtering during school hours (8 AM - 3 PM, weekdays)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="school-hours">Enable School Hours Filtering</Label>
              <p className="text-sm text-muted-foreground">
                Blocks entertainment, games, and social media during school hours to promote focus
              </p>
            </div>
            <Switch
              id="school-hours"
              checked={webFilterConfig.schoolHoursEnabled}
              onCheckedChange={(checked) => handleToggle('schoolHoursEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Web Filter Setup</p>
            <p className="mt-1">
              Your custom web filter profile will be automatically configured on {childName}'s Guardian AI device. 
              You can modify these settings later from your child's profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
