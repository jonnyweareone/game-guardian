import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Shield, Activity, Clock } from "lucide-react";

type DemoEvent = { 
  id: number; 
  device_id: string; 
  type: string; 
  payload: any; 
  created_at: string 
};

type DemoDevice = { 
  device_id: string; 
  child: string | null; 
  status: string | null; 
  last_heartbeat: string | null;
  inserted_at: string;
};

export default function AdminDemo() {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [devices, setDevices] = useState<DemoDevice[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial loads
  useEffect(() => {
    const load = async () => {
      try {
        // Use service role direct queries to demo schema
        const response = await fetch(`https://xzxjwuzwltoapifcyzww.supabase.co/rest/v1/rpc/demo_get_data`, {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDevices(data.devices || []);
          setEvents(data.events || []);
        } else {
          // Fallback: set empty arrays for initial load
          setDevices([]);
          setEvents([]);
        }
      } catch (error) {
        console.error("Failed to load demo data:", error);
        // Fallback to empty arrays if schema access fails
        setDevices([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Realtime subscriptions for demo schema
    const deviceChannel = supabase
      .channel("demo_devices")
      .on("postgres_changes", { 
        event: "*", 
        schema: "demo", 
        table: "devices" 
      }, (payload) => {
        console.log("Device update:", payload);
        const row = payload.new as DemoDevice;
        if (row) {
          setDevices(prev => {
            const others = prev.filter(d => d.device_id !== row.device_id);
            return [row, ...others].slice(0, 200);
          });
        }
      })
      .subscribe();

    const eventChannel = supabase
      .channel("demo_events")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "demo", 
        table: "events" 
      }, (payload) => {
        console.log("New event:", payload);
        const row = payload.new as DemoEvent;
        if (row) {
          setEvents(prev => [row, ...prev].slice(0, 400));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(deviceChannel);
      supabase.removeChannel(eventChannel);
    };
  }, []);

  // KPIs derived client-side
  const kpi = useMemo(() => {
    const now = Date.now();
    const day24h = 24 * 3600 * 1000;
    
    const alerts24 = events.filter(e => 
      e.type === "reflex" && 
      (now - new Date(e.created_at).getTime()) < day24h
    ).length;
    
    const appsToday = events.filter(e => 
      e.type === "app" && 
      (now - new Date(e.created_at).getTime()) < day24h
    ).length;
    
    const dnsToday = events.filter(e => 
      e.type === "dns" && 
      (now - new Date(e.created_at).getTime()) < day24h
    ).length;
    
    const online = devices.filter(d => d.status === "online").length;
    
    return { online, alerts24, appsToday, dnsToday };
  }, [events, devices]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "heartbeat": return <Activity className="h-4 w-4 text-green-500" />;
      case "reflex": return <Shield className="h-4 w-4 text-red-500" />;
      case "app": return <Zap className="h-4 w-4 text-blue-500" />;
      case "dns": return <Shield className="h-4 w-4 text-purple-500" />;
      case "activation": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "sleep": return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "online": return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case "sleeping": return <Badge variant="secondary">Sleeping</Badge>;
      case "registered": return <Badge variant="outline">Registered</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading demo data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin • Demo Mode</h1>
          <p className="text-muted-foreground">Live demonstration dashboard with real-time updates</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Live Demo
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devices Online</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.online}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.alerts24}</div>
            <p className="text-xs text-muted-foreground">Security incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apps Restricted</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.appsToday}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Blocks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.dnsToday}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Devices Table */}
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
            <CardDescription>Real-time device status and heartbeat monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devices.length > 0 ? devices.map(device => (
                <div key={device.device_id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{device.device_id}</div>
                    <div className="text-xs text-muted-foreground">
                      Child: {device.child || 'Unassigned'}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(device.status)}
                    <div className="text-xs text-muted-foreground">
                      {device.last_heartbeat 
                        ? `${new Date(device.last_heartbeat).toLocaleTimeString()}`
                        : 'No heartbeat'
                      }
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No devices registered yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Timeline */}
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle>Live Event Timeline</CardTitle>
            <CardDescription>Real-time activity feed across all demo devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-auto">
              {events.length > 0 ? events.map(event => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <div className="mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{event.device_id}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                    {event.payload && Object.keys(event.payload).length > 0 && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
{JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No events yet - start sending demo data!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Instructions</CardTitle>
          <CardDescription>Send demo data using curl commands or the demo kit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Environment Setup:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{`export SUPABASE_URL="https://xzxjwuzwltoapifcyzww.supabase.co"
export EDGE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo"
export DEVICE="GG-1234-DEMO"`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sample Commands:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{`# Heartbeat
curl -sX POST "$SUPABASE_URL/functions/v1/demo-ingest" \\
  -H "apikey: $EDGE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"heartbeat","device_id":"'$DEVICE'","payload":{}}'

# Reflex Alert  
curl -sX POST "$SUPABASE_URL/functions/v1/demo-ingest" \\
  -H "apikey: $EDGE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"reflex","device_id":"'$DEVICE'","payload":{"kind":"grooming"}}'`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}