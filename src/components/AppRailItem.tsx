import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DeviceAppItem {
  app_id: string;
  name: string;
  icon_url?: string | null;
  category?: 'Game' | 'App' | string | null;
  pegi_rating?: number | null;
}

export interface AppPolicyPatch {
  allowed?: boolean;
  daily_limit_minutes?: number | null;
  enforced_hours?: string[] | null;
}

export function AppRailItem({
  app,
  policy,
  onChange,
}: {
  app: DeviceAppItem;
  policy?: { allowed?: boolean; daily_limit_minutes?: number | null; enforced_hours?: string[] | null } | null;
  onChange: (patch: AppPolicyPatch) => void;
}) {
  const allowed = policy?.allowed ?? true;
  const daily = policy?.daily_limit_minutes ?? '';
  const hours = policy?.enforced_hours?.[0] ?? '';

  return (
    <Card className="flex items-center gap-4 p-3">
      <img
        src={app.icon_url || '/placeholder.svg'}
        alt={`App icon: ${app.name}`}
        className="h-10 w-10 rounded-md object-cover"
        loading="lazy"
      />

      <div className="min-w-0">
        <div className="font-medium truncate">{app.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {app.category || 'App'} {app.pegi_rating ? `• PEGI ${app.pegi_rating}` : ''}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Label htmlFor={`switch-${app.app_id}`} className="text-sm">
            {allowed ? 'Allowed' : 'Blocked'}
          </Label>
          <Switch
            id={`switch-${app.app_id}`}
            checked={allowed}
            onCheckedChange={(v) => onChange({ allowed: !!v })}
            aria-label={allowed ? 'Allowed' : 'Blocked'}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor={`daily-${app.app_id}`} className="text-sm">Daily (min)</Label>
          <Input
            id={`daily-${app.app_id}`}
            type="number"
            inputMode="numeric"
            min={0}
            className="w-24"
            placeholder="mins"
            value={daily as number | ''}
            onChange={(e) =>
              onChange({
                daily_limit_minutes: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Hours</Label>
          <Select
            value={hours}
            onValueChange={(v) => onChange({ enforced_hours: v === 'any' ? null : [v] })}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="[17,20)">After school (17–20)</SelectItem>
              <SelectItem value="[0,6)">Night block (00–06)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
