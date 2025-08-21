export const getProjectRef = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const ref = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (ref) return ref;
  try { 
    return new URL(url).host.split('.')[0]; 
  } catch { 
    // Fallback to known project ID to prevent empty returns
    return 'xzxjwuzwltoapifcyzww'; 
  }
};

export const getFunctionsBase = (): string => 
  `https://${getProjectRef()}.functions.supabase.co`;

export const isDesktopApp = (): boolean =>
  !!(typeof window !== 'undefined' && (window as any).Capacitor) ||
  /Electron/i.test(navigator.userAgent) ||
  import.meta.env.VITE_DESKTOP === 'true';

export const getLocalAgentBase = (): string =>
  import.meta.env.VITE_LOCAL_AGENT_BASE || 'http://127.0.0.1:8719';