import { useState, useEffect, useCallback } from 'react';

interface ActivationStatusData {
  activated: boolean;
  device_jwt?: string;
  device_id?: string;
  status?: string;
}

interface UseActivationStatusReturn {
  loading: boolean;
  activated: boolean;
  status?: string;
  deviceJwt?: string;
  error?: string;
  retry: () => void;
}

export function useActivationStatus(deviceId: string | null): UseActivationStatusReturn {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<string>();
  const [deviceJwt, setDeviceJwt] = useState<string>();
  const [error, setError] = useState<string>();
  const [timeoutReached, setTimeoutReached] = useState(false);

  const SUPABASE_URL = "https://xzxjwuzwltoapifcyzww.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo";

  const checkActivationStatus = useCallback(async () => {
    if (!deviceId || timeoutReached) return;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/activation-status?device_id=${encodeURIComponent(deviceId)}`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ActivationStatusData = await response.json();
      
      if (data.activated && data.device_jwt) {
        setActivated(true);
        setDeviceJwt(data.device_jwt);
        setStatus(data.status || 'active');
        setLoading(false);
      } else {
        setStatus(data.status || 'pending');
      }
    } catch (err) {
      console.error('Activation status check failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, [deviceId, timeoutReached, SUPABASE_URL, SUPABASE_ANON_KEY]);

  const startPolling = useCallback(() => {
    if (!deviceId) return;

    setLoading(true);
    setError(undefined);
    setActivated(false);
    setDeviceJwt(undefined);
    setTimeoutReached(false);

    // Initial check
    checkActivationStatus();

    // Set up polling
    const pollInterval = setInterval(checkActivationStatus, 2000);
    
    // Set up timeout after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setTimeoutReached(true);
      setLoading(false);
      if (!activated) {
        setError('Activation polling timed out. Please try again.');
      }
    }, 15000);

    // Cleanup function
    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [deviceId, checkActivationStatus, activated]);

  const retry = useCallback(() => {
    setTimeoutReached(false);
    setError(undefined);
    startPolling();
  }, [startPolling]);

  useEffect(() => {
    if (!deviceId) return;
    return startPolling();
  }, [deviceId, startPolling]);

  // Stop polling when activated
  useEffect(() => {
    if (activated && deviceJwt) {
      setLoading(false);
    }
  }, [activated, deviceJwt]);

  return {
    loading,
    activated,
    status,
    deviceJwt,
    error,
    retry,
  };
}