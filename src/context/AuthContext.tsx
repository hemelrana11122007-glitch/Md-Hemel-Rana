import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi, AuthUser, DevEmail, getCsrfToken } from '../services/authApi';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'buyer' | 'seller' | 'admin' | null;
  csrfToken: string | null;
  devEmails: DevEmail[];
  isMailboxOpen: boolean;
  setIsMailboxOpen: (open: boolean) => void;
  login: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    require2FA?: boolean;
    tempToken?: string;
    error?: string;
    user?: AuthUser;
  }>;
  login2FA: (tempToken: string, code: string) => Promise<{
    success: boolean;
    error?: string;
    user?: AuthUser;
  }>;
  register: (data: { name: string; store_name?: string; email: string; password: string; role?: string; phone?: string; business_type?: string }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    user?: AuthUser;
  }>;
  verifyEmail: (token: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  fetchDevEmails: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [devEmails, setDevEmails] = useState<DevEmail[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState<boolean>(false);

  const isAuthenticated = useMemo(() => !!user, [user]);
  const role = useMemo<'buyer' | 'seller' | 'admin' | null>(() => (user ? user.role : null), [user]);

  const fetchDevEmails = useCallback(async () => {
    try {
      const list = await authApi.getDevEmails();
      setDevEmails(list);
    } catch {
      // Ignore background mailbox poll errors
    }
  }, []);

  /**
   * Automatic session check (GET /api/auth/me) with transparent refresh fallback
   */
  const refreshUser = useCallback(async () => {
    try {
      let currentUser = await authApi.getMe();
      if (!currentUser) {
        // If access token is expired or not set, try rotating with refresh cookie
        const refreshed = await authApi.refreshToken();
        if (refreshed) {
          currentUser = await authApi.getMe();
        }
      }
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const res = await authApi.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    },
    []
  );

  const login2FA = useCallback(
    async (tempToken: string, code: string) => {
      const res = await authApi.login2FA(tempToken, code);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    },
    []
  );

  const register = useCallback(
    async (data: { name: string; store_name?: string; email: string; password: string; role?: string; phone?: string; business_type?: string }) => {
      const res = await authApi.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        await fetchDevEmails();
      }
      return res;
    },
    [fetchDevEmails]
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      const res = await authApi.verifyEmail(token);
      if (res.success) {
        await refreshUser();
      }
      return res;
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  // On initial mount: retrieve anti-CSRF token and verify HTTP-Only cookie via GET /api/auth/me
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const token = await getCsrfToken();
        if (isMounted) setCsrfToken(token);
        await refreshUser();
        await fetchDevEmails();
      } catch (err) {
        console.error('Initial authentication check error:', err);
        if (isMounted) setIsLoading(false);
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, [refreshUser, fetchDevEmails]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        role,
        csrfToken,
        devEmails,
        isMailboxOpen,
        setIsMailboxOpen,
        login,
        login2FA,
        register,
        verifyEmail,
        refreshUser,
        logout,
        setUser,
        fetchDevEmails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
