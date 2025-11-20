import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { getMe } from '../lib/api';
import { useRouter } from 'next/router';

type User = { id: string; name: string; email: string; roles: string[] } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  hasRole: (...roles: string[]) => boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasRole: () => false,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
      // Only redirect if not already on login page
      if (router.pathname !== '/login') {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    }
  }, [router.pathname]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    hasRole: (...roles: string[]) => {
      const userRoles = user?.roles || [];
      return roles.some((r) => userRoles.includes(r));
    },
    logout: () => {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      window.location.replace('/login');
    },
    refreshUser,
  }), [user, loading, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
