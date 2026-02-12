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
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Verify session on mount using the verify endpoint
  useEffect(() => {
    setIsHydrated(true);
    setIsLoading(true);

    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          // Session is valid, but we need user info
          // Get user info from localStorage as fallback, or from a user endpoint
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken('authenticated'); // Token exists server-side via cookie
          }
        } else {
          // Session invalid or expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
          setToken(null);
          
          // Redirect to login if on a protected route
          const pathname = window.location.pathname;
          if (['/chat', '/dashboard', '/admin'].some(route => pathname.startsWith(route))) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        // On error, clear auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router]);

  const setAuthData = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    // Store user data for reload persistence
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    // Don't store token in localStorage - rely on HTTP-only cookie
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: isLoading && isHydrated,
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
