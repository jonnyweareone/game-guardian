
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Play, Square, Shield } from "lucide-react";

type Job = {
  id: string;
  type: string;
  status: string;
  attempts: number;
  payload: any;
  created_at: string;
  updated_at: string;
};

interface DeviceJobsPanelProps {
  deviceId: string;
}

export default function DeviceJobsPanel({ deviceId }: DeviceJobsPanelProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("device_jobs")
      .select("id,type,status,attempts,payload,created_at,updated_at")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setJobs(data as Job[]);
    }
    setLoading(false);
  }

  async function createJob(type: string, payload: any = {}) {
    const { error } = await supabase
      .from("device_jobs")
      .insert({
        device_id: deviceId,
        type,
        status: "queued",
        payload
      });

    if (!error) {
      loadJobs(); // Refresh the list
    }
  }

  useEffect(() => {
    loadJobs();
  }, [deviceId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className?: string }> = {
      queued: { variant: "secondary" },
      running: { variant: "default", className: "bg-blue-600" },
      success: { variant: "default", className: "bg-green-600" },
      failed: { variant: "destructive" }
    };
    
    const config = variants[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'ALLOW_APP':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'BLOCK_APP':
        return <Square className="h-4 w-4 text-red-600" />;
      case 'APPLY_POLICY':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Device Jobs
            <Badge variant="outline">{jobs.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => createJob("APPLY_POLICY", { refresh: true })}
            >
              <Shield className="h-4 w-4 mr-1" />
              Apply Policy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadJobs} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No jobs yet. Device jobs will appear here when actions are triggered.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getJobIcon(job.type)}
                    <span className="font-medium">{job.type}</span>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(job.created_at).toLocaleString()}
                  {job.attempts > 0 && (
                    <span className="ml-2">• Attempts: {job.attempts}</span>
                  )}
                </div>

                {Object.keys(job.payload || {}).length > 0 && (
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <strong>Payload:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {JSON.stringify(job.payload, null, 2)}
                    </pre>
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
