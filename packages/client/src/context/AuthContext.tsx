'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  handle: string;
  displayName: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  verifyToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  verifyToken: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for token
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      const response = await api.post('/auth/login', { email });
      
      // For development, log the magic link
      if (process.env.NODE_ENV === 'development') {
        console.log('Magic link:', response.data.magicLink);
        toast.success('Check console for magic link');
      }
      
      toast.success('Magic link sent to your email');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to send magic link');
      throw error;
    }
  };

  const verifyToken = async (magicToken: string) => {
    try {
      const response = await api.get(`/auth/verify?token=${magicToken}`);
      const { token: authToken } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      
      await fetchUserData(authToken);
      toast.success('Successfully logged in!');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      toast.error('Invalid or expired token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}; 