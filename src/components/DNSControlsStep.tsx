
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface DNSConfig {
  schoolHoursEnabled: boolean;
  nextDnsConfig: string;
}

interface DNSControlsStepProps {
  dnsConfig: DNSConfig;
  onDnsConfigChange: (config: DNSConfig) => void;
  childName: string;
}

export function DNSControlsStep({ dnsConfig, onDnsConfigChange, childName }: DNSControlsStepProps) {
  const handleToggleSchoolHours = (enabled: boolean) => {
    onDnsConfigChange({
      ...dnsConfig,
      schoolHoursEnabled: enabled
    });
  };

  const handleDnsConfigChange = (value: string) => {
    onDnsConfigChange({
      ...dnsConfig,
      nextDnsConfig: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          DNS Filtering & Controls
        </h3>
        <p className="text-sm text-muted-foreground">
          Set up DNS-based content filtering and time restrictions for {childName}.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            School Hours Protection
          </CardTitle>
          <CardDescription>
            Enable enhanced filtering during school hours (8 AM - 3 PM, weekdays)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="school-hours">Enable School Hours Filtering</Label>
              <p className="text-sm text-muted-foreground">
                Blocks social media and entertainment sites during school hours
              </p>
            </div>
            <Switch
              id="school-hours"
              checked={dnsConfig.schoolHoursEnabled}
              onCheckedChange={handleToggleSchoolHours}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Custom DNS Configuration
          </CardTitle>
          <CardDescription>
            Configure NextDNS or other DNS filtering service (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dns-config">DNS Configuration ID</Label>
            <Input
              id="dns-config"
              value={dnsConfig.nextDnsConfig}
              onChange={(e) => handleDnsConfigChange(e.target.value)}
              placeholder="e.g., abc123 (NextDNS Configuration ID)"
            />
            <p className="text-xs text-muted-foreground">
              Enter your NextDNS configuration ID or leave blank to use default filtering
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-orange-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">DNS Setup Required</p>
                <p className="text-orange-700 mt-1">
                  To use custom DNS filtering, you'll need to configure your router or device to use the Guardian AI DNS servers. Instructions will be provided after profile creation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        These settings can be modified later in your child's profile settings.
      </div>
    </div>
  );
}
