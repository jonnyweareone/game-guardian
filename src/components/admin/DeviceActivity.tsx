
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Monitor, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type EventRow = { 
  ts: string; 
  type: string; 
  payload: any;
  child_id: string | null;
};

interface DeviceActivityProps {
  deviceCode: string;
}

export default function DeviceActivity({ deviceCode }: DeviceActivityProps) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("device_events")
      .select("ts,type,payload,child_id")
      .eq("device_code", deviceCode)
      .order("ts", { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setEvents(data as EventRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, [deviceCode]);

  const currentApp = events.find(e => e.type === "app_foreground")?.payload?.app_name;
  const lastActivity = events.length > 0 ? events[0] : null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'app_foreground':
        return <Monitor className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBadge = (type: string) => {
    const variants: Record<string, { variant: any; className?: string }> = {
      app_foreground: { variant: "default", className: "bg-blue-600" },
    };
    
    const config = variants[type] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Device Activity
            <Badge variant="outline">{events.length}</Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadEvents} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Status */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current App</div>
              <div className="font-mono text-sm">
                {currentApp || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Activity</div>
              <div className="text-sm">
                {lastActivity ? (
                  formatDistanceToNow(new Date(lastActivity.ts), { addSuffix: true })
                ) : (
                  "No recent activity"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent events. Device telemetry will appear here when the device sends data.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    {getEventBadge(event.type)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(event.ts), { addSuffix: true })}
                  </div>
                </div>

                {event.payload && Object.keys(event.payload).length > 0 && (
                  <div className="bg-muted/30 p-2 rounded text-xs">
                    {event.type === 'app_foreground' && event.payload.app_name ? (
                      <div>
                        <strong>App:</strong> {event.payload.app_name}
                        {event.payload.window_title && (
                          <div className="mt-1">
                            <strong>Window:</strong> {event.payload.window_title}
                          </div>
                        )}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {event.child_id && (
                  <div className="text-xs text-muted-foreground">
                    Child ID: {event.child_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
