import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { User, AlertTriangle, Clock, CheckCircle, Smartphone } from "lucide-react";

interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  age: number | null;
}

interface Device {
  id: string;
  device_name: string | null;
  device_code: string;
  status: string | null;
  last_seen: string | null;
}

interface Alert {
  id: string;
  alert_type: string;
  risk_level: string;
  ai_summary: string;
  flagged_at: string;
}

interface EnhancedChildCardProps {
  child: Child;
  device?: Device | null;
  alerts: Alert[];
}

export function EnhancedChildCard({ child, device, alerts }: EnhancedChildCardProps) {
  const navigate = useNavigate();

  const deviceStatus = device?.status === 'online' ? 'Online' : 'Offline';
  const lastSeen = device?.last_seen ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true }) : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={child.avatar_url || "/avatars/missing.png"} />
            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">{child.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {child.age ? `${child.age} years old` : 'Age not specified'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {device ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              {device.status === 'online' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-gray-500" />
              )}
              <span>
                Device: {device.device_name || device.device_code} • {deviceStatus}
                {lastSeen && ` (last seen ${lastSeen})`}
              </span>
            </div>
            {alerts.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 inline-block mr-1 align-middle text-amber-500" />
                  Recent Alerts:
                </div>
                {alerts.map((alert) => (
                  <div key={alert.id} className="text-sm text-muted-foreground">
                    {alert.ai_summary} ({alert.risk_level})
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">No device associated with this child.</div>
        )}
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/children/${child.id}`)}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/children/${child.id}/apps`)}
            className="flex items-center gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Apps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
