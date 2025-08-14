
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, Calendar } from 'lucide-react';

interface DigestSelectProps {
  value: 'NONE' | 'HOURLY' | 'DAILY';
  onValueChange: (value: 'NONE' | 'HOURLY' | 'DAILY') => void;
  className?: string;
}

const digestOptions = [
  { value: 'NONE' as const, label: 'Immediate', icon: Bell, description: 'Get alerts right away' },
  { value: 'HOURLY' as const, label: 'Hourly', icon: Clock, description: 'Bundle alerts every hour' },
  { value: 'DAILY' as const, label: 'Daily', icon: Calendar, description: 'Daily summary at 8 AM' },
];

export default function DigestSelect({ value, onValueChange, className }: DigestSelectProps) {
  const currentDigest = digestOptions.find(opt => opt.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {currentDigest && (
            <div className="flex items-center gap-2">
              <currentDigest.icon className="h-4 w-4" />
              <span>{currentDigest.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {digestOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
