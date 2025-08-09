import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getTotpSetup: () => Promise<any>;
  verifyTotp: (code: string) => Promise<any>;
  rotateRecoveryCodes: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Clean up any existing auth state to prevent limbo
    try {
      // Attempt global sign out (ignore errors)
      // @ts-ignore - scope is available in supabase-js v2
      await supabase.auth.signOut({ scope: 'global' } as any);
    } catch {}
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {}

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
      try {
        // @ts-ignore - scope is available in supabase-js v2
        await supabase.auth.signOut({ scope: 'global' } as any);
      } catch {}
    } finally {
      // Force full reload to clear state
      window.location.href = '/auth';
    }
  };

  const getTotpSetup = async () => {
    return supabase.functions.invoke('auth-2fa', { body: { action: 'totp_setup' } });
  };

  const verifyTotp = async (code: string) => {
    return supabase.functions.invoke('auth-2fa', { body: { action: 'totp_verify', code } });
  };

  const rotateRecoveryCodes = async () => {
    return supabase.functions.invoke('auth-2fa', { body: { action: 'recovery_rotate' } });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    // 2FA helpers
    getTotpSetup,
    verifyTotp,
    rotateRecoveryCodes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};