'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setAuthData: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ start true to prevent flash
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      // First: try to restore from localStorage immediately (no flicker)
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          // Sync cookie so middleware can see it
          document.cookie = `auth_token=${storedToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }

      // Then: verify with server in background
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          // Server says invalid — clear everything
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          document.cookie = 'auth_token=; path=/; max-age=0';
          setUser(null);
          setToken(null);
        }
      } catch {
        // Network error — keep local state, don't log out
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const setAuthData = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    // ✅ Sync cookie for middleware
    document.cookie = `auth_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue logout even if request fails
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        logout,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
