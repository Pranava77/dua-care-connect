import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/lib/mockData';
import { User, UserRole, ROLE_PERMISSIONS } from '@/lib/rbac';

interface MockSession {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: MockSession | null;
  signOut: () => Promise<void>;
  loading: boolean;
  updateUserRole: (role: UserRole) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage synchronously first
    const storedSession = localStorage.getItem('mock-session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setUser(parsed.user);
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('mock-session');
      }
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    await mockApi.signOut();
    setSession(null);
    setUser(null);
    navigate('/login');
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = {
        ...user,
        role,
        permissions: ROLE_PERMISSIONS[role]
      };
      setUser(updatedUser);
      
      // Update session in localStorage
      if (session) {
        const updatedSession = {
          ...session,
          user: updatedUser
        };
        localStorage.setItem('mock-session', JSON.stringify(updatedSession));
        setSession(updatedSession);
      }
    }
  };

  const refreshSession = async () => {
    try {
      const { data } = await mockApi.getSession();
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, loading, updateUserRole, refreshSession }}>
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
