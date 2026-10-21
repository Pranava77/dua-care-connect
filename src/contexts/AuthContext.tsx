import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { AUTH_EXPIRED_EVENT, sessionStore, type Session } from '@/lib/api/client';
import { User } from '@/lib/rbac';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => sessionStore.get());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clear = useCallback(() => {
    sessionStore.clear();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const store = (next: Session) => {
    sessionStore.set(next);
    setSession(next);
  };

  const refreshSession = useCallback(async () => {
    const current = sessionStore.get();
    if (!current) {
      setSession(null);
      return;
    }
    try {
      // Permissions come from the server, never from what the browser has cached.
      const user = await authApi.me();
      store({ ...current, user });
    } catch {
      clear();
    }
  }, [clear]);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  useEffect(() => {
    const onExpired = () => {
      clear();
      navigate('/login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clear, navigate]);

  const signIn = async (email: string, password: string) => {
    const { session: next } = await authApi.signIn(email, password);
    store(next);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { session: next } = await authApi.signUp(email, password, name);
    store(next);
  };

  const signOut = async () => {
    clear();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
