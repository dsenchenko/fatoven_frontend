import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/endpoints';
import { clearToken, getToken, setToken } from '@/api/auth-storage';
import type { User } from '@/api/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithToken: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: hasToken,
    retry: false,
  });

  const loginWithToken = useCallback(
    (token: string) => {
      setToken(token);
      setHasToken(true);
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearToken();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isLoading: hasToken && (isLoading || isFetching),
      isAuthenticated: hasToken && Boolean(data?.user),
      loginWithToken,
      logout,
      refreshUser,
    }),
    [data?.user, hasToken, isLoading, isFetching, loginWithToken, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
