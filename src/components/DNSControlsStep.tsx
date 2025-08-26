
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Shield, CheckCircle } from 'lucide-react';

interface DNSConfig {
  schoolHoursEnabled: boolean;
  nextDnsConfig: string;
  socialMediaBlocked: boolean;
  gamingBlocked: boolean;
  entertainmentBlocked: boolean;
}

interface DNSControlsStepProps {
  dnsConfig: DNSConfig;
  onDnsConfigChange: (config: DNSConfig) => void;
  childName: string;
}

export function DNSControlsStep({ dnsConfig, onDnsConfigChange, childName }: DNSControlsStepProps) {
  const [socialMediaBlocked, setSocialMediaBlocked] = useState(true);
  const [gamingBlocked, setGamingBlocked] = useState(true);
  const [entertainmentBlocked, setEntertainmentBlocked] = useState(true);

  const handleToggle = (field: keyof DNSConfig, value: boolean) => {
    onDnsConfigChange({
      ...dnsConfig,
      [field]: value
    });
    
    // Update local state for additional controls
    if (field === 'socialMediaBlocked') setSocialMediaBlocked(value);
    if (field === 'gamingBlocked') setGamingBlocked(value);
    if (field === 'entertainmentBlocked') setEntertainmentBlocked(value);
  };

  const blockedCategories = [
    'Adult Content',
    'Terrorism & Extremism', 
    'Gambling',
    'Violence & Weapons',
    'Drugs & Alcohol'
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Web Filters & Protection
        </h3>
        <p className="text-sm text-muted-foreground">
          Guardian AI will automatically create age-appropriate web filtering for {childName}.
        </p>
      </div>

      {/* Automatic Protection Active */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <h4 className="font-medium">Automatic Protection Active</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          These categories have been automatically removed to safeguard {childName}:
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {blockedCategories.map((category, index) => (
            <div key={category} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Search Enabled */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <h4 className="font-medium">Safe Search Enabled</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Safe Search is automatically enabled across all search engines
        </p>
        <p className="text-sm text-muted-foreground">
          Filters explicit content from search results on Google, Bing, YouTube, and other platforms to ensure {childName} sees age-appropriate content.
        </p>
      </div>

      {/* Additional Content Controls */}
      <div className="space-y-4">
        <h4 className="font-medium">Additional Content Controls</h4>
        <p className="text-sm text-muted-foreground">
          Choose additional categories to filter based on {childName}'s age and your family preferences
        </p>
        
        <div className="space-y-4">
          {/* Social Media Platforms */}
          <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="font-medium">Social Media Platforms</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Block access to social media during device use (Recommended for ages under 13)
              </p>
            </div>
            <Switch
              checked={socialMediaBlocked}
              onCheckedChange={(value) => handleToggle('socialMediaBlocked', value)}
            />
          </div>

          {/* Gaming Platforms */}
          <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="font-medium">Gaming Platforms</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Block web-based gaming sites and platforms (Age-appropriate filtering applied)
              </p>
            </div>
            <Switch
              checked={gamingBlocked}
              onCheckedChange={(value) => handleToggle('gamingBlocked', value)}
            />
          </div>

          {/* Entertainment & Streaming */}
          <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span className="font-medium">Entertainment & Streaming</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Block streaming and entertainment sites during device use
              </p>
            </div>
            <Switch
              checked={entertainmentBlocked}
              onCheckedChange={(value) => handleToggle('entertainmentBlocked', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
