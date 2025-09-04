import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Users, Shield, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { invokeEdgeFunction, bulkCreateDnsProfiles } from '@/lib/supabase-functions';

interface DatabaseCounts {
  children: number;
  configs: number;
  profiles: number;
}

export default function AdminDnsProfiles() {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isCreatingProfiles, setIsCreatingProfiles] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [profilesResult, setProfilesResult] = useState<any>(null);
  const queryClient = useQueryClient();

  // Load database counts
  const { data: counts, isLoading: countsLoading, refetch: refetchCounts } = useQuery({
    queryKey: ['admin-dns-counts'],
    queryFn: async (): Promise<DatabaseCounts> => {
      const [childrenRes, configsRes, profilesRes] = await Promise.all([
        supabase.from('children').select('id', { count: 'exact' }),
        supabase.from('household_dns_configs').select('id', { count: 'exact' }),
        supabase.from('child_dns_profiles').select('id', { count: 'exact' })
      ]);

      if (childrenRes.error) throw childrenRes.error;
      if (configsRes.error) throw configsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      return {
        children: childrenRes.count || 0,
        configs: configsRes.count || 0,
        profiles: profilesRes.count || 0
      };
    }
  });

  const handleProvisionConfig = async () => {
    setIsProvisioning(true);
    setProvisionResult(null);
    
    try {
      const { data, error } = await invokeEdgeFunction('provision-nextdns', {
        device_id: 'admin-provision', // Special device ID for admin provisioning
        config_name: 'admin-bulk-provision'
      });

      if (error) throw error;

      setProvisionResult(data);
      await refetchCounts();
      toast.success('NextDNS config provisioned successfully');
    } catch (error) {
      console.error('Error provisioning config:', error);
      toast.error(`Failed to provision config: ${error}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCreateProfiles = async () => {
    if (!provisionResult?.configId) {
      toast.error('Please provision a NextDNS config first');
      return;
    }

    setIsCreatingProfiles(true);
    setProfilesResult(null);
    
    try {
      const { data, error } = await bulkCreateDnsProfiles(provisionResult.configId);

      if (error) throw error;

      setProfilesResult(data);
      await refetchCounts();
      toast.success(`Created ${data?.created?.length || 0} DNS profiles successfully`);
    } catch (error) {
      console.error('Error creating profiles:', error);
      toast.error(`Failed to create profiles: ${error}`);
    } finally {
      setIsCreatingProfiles(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">DNS Profiles Management</h1>
        <p className="text-sm text-muted-foreground">
          Temporary admin tool to provision NextDNS config and create child profiles
        </p>
      </div>

      {/* Database Counts */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : counts?.children || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Configs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : counts?.configs || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Child DNS Profiles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : counts?.profiles || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Provision NextDNS Config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              First, create or verify a NextDNS configuration for the household.
            </p>
            <Button 
              onClick={handleProvisionConfig} 
              disabled={isProvisioning}
              className="w-full sm:w-auto"
            >
              {isProvisioning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Provision NextDNS Config
            </Button>
            
            {provisionResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Config ID:</strong> {provisionResult.configId}<br />
                  <strong>Status:</strong> {provisionResult.existing ? 'Existing' : 'Created'}
                  {provisionResult.configName && <><br /><strong>Name:</strong> {provisionResult.configName}</>}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Create Child DNS Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create DNS profiles for all existing children. Each child will get a profile named with their UUID for anonymity.
            </p>
            <Button 
              onClick={handleCreateProfiles} 
              disabled={isCreatingProfiles || !provisionResult?.configId}
              className="w-full sm:w-auto"
            >
              {isCreatingProfiles ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Create All Child Profiles
            </Button>
            
            {!provisionResult?.configId && (
              <p className="text-xs text-muted-foreground">
                ⚠️ Provision a NextDNS config first
              </p>
            )}
            
            {profilesResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Created:</strong> {profilesResult.created?.length || 0} new profiles<br />
                  <strong>Linked:</strong> {profilesResult.linked?.length || 0} existing profiles
                  {profilesResult.created?.length > 0 && (
                    <>
                      <br /><strong>Profile IDs:</strong> {profilesResult.created.map((p: any) => p.nextdns_profile_id).join(', ')}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          onClick={() => refetchCounts()}
          disabled={countsLoading}
          size="sm"
        >
          {countsLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Counts
        </Button>
      </div>

      <Alert className="mt-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Temporary Component:</strong> This admin tool is designed for one-time use to set up DNS profiles for existing children. It can be safely removed after completion.
        </AlertDescription>
      </Alert>
    </div>
  );
}