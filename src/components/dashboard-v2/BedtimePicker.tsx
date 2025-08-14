
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

interface BedtimePickerProps {
  value?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  onValueChange: (value: { enabled: boolean; start: string; end: string }) => void;
  className?: string;
}

export default function BedtimePicker({ value, onValueChange, className }: BedtimePickerProps) {
  const [bedtime, setBedtime] = useState(value || {
    enabled: false,
    start: '21:00',
    end: '07:00'
  });

  const handleChange = (updates: Partial<typeof bedtime>) => {
    const newValue = { ...bedtime, ...updates };
    setBedtime(newValue);
    onValueChange(newValue);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-4 w-4" />
            Bedtime Schedule
          </CardTitle>
          <Switch
            checked={bedtime.enabled}
            onCheckedChange={(enabled) => handleChange({ enabled })}
          />
        </div>
      </CardHeader>
      
      {bedtime.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Moon className="h-3 w-3" />
                Bedtime
              </Label>
              <Input
                type="time"
                value={bedtime.start}
                onChange={(e) => handleChange({ start: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Sun className="h-3 w-3" />
                Wake up
              </Label>
              <Input
                type="time"
                value={bedtime.end}
                onChange={(e) => handleChange({ end: e.target.value })}
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            During bedtime, device access will be restricted and notifications will be silenced.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
