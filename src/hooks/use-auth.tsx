
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const USERS_STORAGE_KEY = 'campus-flow-users';
const SESSION_STORAGE_KEY = 'campus-flow-session';

interface User {
  id: string;
  username: string;
  role: 'student' | 'faculty' | 'admin';
  password? : string; // In a real app, this would be a hash
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, role: 'student' | 'faculty') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get users from localStorage
const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
        return JSON.parse(usersJson);
    }
    // Add default admin user if no users exist
    const adminUser: User = { id: 'admin-user', username: 'admin', role: 'admin', password: 'admin@123' };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
    return [adminUser];
}

// Helper to store users in localStorage
const setStoredUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize users on first load
    getStoredUsers();

    // Check for user session in local storage on initial load
    const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getStoredUsers();
        const foundUser = users.find(u => u.username === username && u.password === password);
        
        if (foundUser) {
          const { password, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userToStore));
          resolve();
        } else {
          reject(new Error('Invalid username or password.'));
        }
      }, 500);
    });
  };

  const signup = async (username: string, password: string, role: 'student' | 'faculty'): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getStoredUsers();
            if (users.some(u => u.username === username)) {
                return reject(new Error('Username is already taken.'));
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                username,
                password,
                role,
            };

            const updatedUsers = [...users, newUser];
            setStoredUsers(updatedUsers);
            resolve();
        }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
