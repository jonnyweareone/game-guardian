import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ISPSession {
  email: string;
  ispCode: string;
  role: string;
  loginTime: number;
}

interface ISPAuthContextType {
  session: ISPSession | null;
  loading: boolean;
  login: (email: string, password: string, ispCode: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ISPAuthContext = createContext<ISPAuthContextType | undefined>(undefined);

export const ISPAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<ISPSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedSession = localStorage.getItem('isp-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - parsed.loginTime;
        if (sessionAge < 24 * 60 * 60 * 1000) {
          setSession(parsed);
        } else {
          localStorage.removeItem('isp-session');
        }
      } catch {
        localStorage.removeItem('isp-session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, ispCode: string): Promise<boolean> => {
    try {
      // Mock authentication - in production this would call a real API
      if (email === 'admin@isp.com' && password === 'admin123' && ispCode === 'ISP001') {
        const newSession: ISPSession = {
          email,
          ispCode,
          role: 'isp_admin',
          loginTime: Date.now()
        };
        
        localStorage.setItem('isp-session', JSON.stringify(newSession));
        setSession(newSession);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('isp-session');
    setSession(null);
  };

  const value: ISPAuthContextType = {
    session,
    loading,
    login,
    logout,
    isAuthenticated: !!session
  };

  return (
    <ISPAuthContext.Provider value={value}>
      {children}
    </ISPAuthContext.Provider>
  );
};

export const useISPAuth = () => {
  const context = useContext(ISPAuthContext);
  if (context === undefined) {
    throw new Error('useISPAuth must be used within an ISPAuthProvider');
  }
  return context;
};