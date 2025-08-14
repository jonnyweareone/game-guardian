
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, AlertCircle, Shield } from 'lucide-react';

interface SeveritySelectProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

const severityOptions = [
  { value: 1, label: 'Info', icon: Info, color: 'text-blue-500' },
  { value: 2, label: 'Warning', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 3, label: 'High', icon: AlertCircle, color: 'text-orange-500' },
  { value: 4, label: 'Critical', icon: Shield, color: 'text-red-500' },
];

export default function SeveritySelect({ value, onValueChange, className }: SeveritySelectProps) {
  const currentSeverity = severityOptions.find(opt => opt.value === value);

  return (
    <Select value={value.toString()} onValueChange={(val) => onValueChange(parseInt(val))}>
      <SelectTrigger className={className}>
        <SelectValue>
          {currentSeverity && (
            <div className="flex items-center gap-2">
              <currentSeverity.icon className={`h-4 w-4 ${currentSeverity.color}`} />
              <span>{currentSeverity.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {severityOptions.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            <div className="flex items-center gap-2">
              <option.icon className={`h-4 w-4 ${option.color}`} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
