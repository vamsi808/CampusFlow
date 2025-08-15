"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user session in local storage on initial load
    const storedUser = localStorage.getItem('campus-flow-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        if (username === 'admin' && password === 'admin@123') {
          const adminUser: User = { id: 'admin-user', username: 'admin', role: 'admin' };
          setUser(adminUser);
          localStorage.setItem('campus-flow-user', JSON.stringify(adminUser));
          resolve();
        } else if (username && password) {
          const regularUser: User = { id: 'regular-user', username, role: 'user' };
          setUser(regularUser);
          localStorage.setItem('campus-flow-user', JSON.stringify(regularUser));
          resolve();
        }else {
          reject(new Error('Invalid username or password.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus-flow-user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
