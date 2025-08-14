
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Clock, CheckCircle, Info } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          DNS Filtering & Controls
        </h3>
        <p className="text-sm text-muted-foreground">
          Guardian AI will automatically create a custom NextDNS profile for {childName} with age-appropriate filtering.
        </p>
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-green-800">
            <CheckCircle className="h-4 w-4" />
            Automatic DNS Profile Creation
          </CardTitle>
          <CardDescription className="text-green-700">
            A NextDNS profile will be created automatically with age-appropriate content filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-green-700">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">What's included:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Age-appropriate content blocking based on PEGI ratings</li>
                <li>• Security protection (malware, phishing, scams)</li>
                <li>• Privacy protection (tracker blocking)</li>
                <li>• Custom Guardian AI block page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
                Blocks social media, games, and entertainment sites during school hours
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

      <div className="p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">DNS Setup</p>
            <p className="mt-1">
              The custom DNS profile will be automatically pushed to your Guardian AI device. 
              No manual configuration required. You can modify these settings later from your child's profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
