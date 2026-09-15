import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, FinancialProfile } from '../types/index.js';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  profile: FinancialProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  simulateOAuthLogin: (provider: string, email?: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setHasCompletedOnboarding: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  const fetchCurrentUser = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await api.getMe();
      setUser(res.user);
      setHasCompletedOnboarding(res.hasCompletedOnboarding);

      if (res.hasCompletedOnboarding) {
        const profRes = await api.getProfile();
        setProfile(profRes.profile);
      }
    } catch (err) {
      console.warn('Authentication check failed:', err);
      clearStoredToken();
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setHasCompletedOnboarding(res.hasCompletedOnboarding);

      if (res.hasCompletedOnboarding) {
        const profRes = await api.getProfile();
        setProfile(profRes.profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setHasCompletedOnboarding(false);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin();
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setHasCompletedOnboarding(res.hasCompletedOnboarding);

      const profRes = await api.getProfile();
      setProfile(profRes.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOAuthLogin = async (provider: string, email?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.simulateOAuth(provider, email, name);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setHasCompletedOnboarding(res.hasCompletedOnboarding);

      if (res.hasCompletedOnboarding) {
        const profRes = await api.getProfile();
        setProfile(profRes.profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
    setHasCompletedOnboarding(false);
    api.logout().catch(() => {});
  };

  const refreshProfile = async () => {
    try {
      const profRes = await api.getProfile();
      setProfile(profRes.profile);
      if (profRes.profile) {
        setHasCompletedOnboarding(true);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        hasCompletedOnboarding,
        login,
        register,
        demoLogin,
        simulateOAuthLogin,
        logout,
        refreshProfile,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
