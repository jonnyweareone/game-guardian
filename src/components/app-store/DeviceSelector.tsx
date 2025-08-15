
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Smartphone } from "lucide-react";

interface DeviceSelectorProps {
  deviceContext: string;
  onDeviceChange: (device: string) => void;
}

export default function DeviceSelector({ deviceContext, onDeviceChange }: DeviceSelectorProps) {
  return (
    <Select value={deviceContext} onValueChange={onDeviceChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desktop">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Desktop Apps
          </div>
        </SelectItem>
        <SelectItem value="mobile" disabled>
          <div className="flex items-center gap-2 opacity-50">
            <Smartphone className="w-4 h-4" />
            Mobile Apps
            <span className="text-xs text-muted-foreground ml-1">(Coming Soon)</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
