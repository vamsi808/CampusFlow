
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase'; // Import the initialized app
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  Auth
} from "firebase/auth";
import type { User } from '@/lib/types';
import { useToast } from './use-toast';

const USERS_STORAGE_KEY = 'campus-flow-users';
const SESSION_STORAGE_KEY = 'campus-flow-session';

type SignupData = Omit<User, 'id' | 'dateJoined' | 'status' | 'confirmPassword'>;

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (data: Partial<Omit<User, 'id' | 'username' | 'role' | 'password'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get users from localStorage
const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
        try {
            const parsed = JSON.parse(usersJson);
            // Ensure default admin user always has correct status
             return parsed.map((u: User) => {
                if (u.username === 'admin') {
                    return { ...u, id: 'admin-user', status: 'approved', role: 'admin' };
                }
                if (u.username === 'student') {
                    return { ...u, id: 'student-user', status: 'approved', role: 'student', sectionId: 'sec-it-b-2' };
                }
                return u;
            });
        } catch (e) {
            console.error("Failed to parse users from localStorage", e);
            return [];
        }
    }
    // Add default users if no users exist
    const defaultUsers: User[] = [
        { 
            id: 'admin-user', 
            username: 'admin', 
            role: 'admin', 
            password: 'admin@123', 
            fullName: 'Admin User', 
            email: 'admin@campusflow.app', 
            dateJoined: new Date().toISOString(), 
            avatarUrl: 'https://i.pravatar.cc/150?u=admin',
            jobTitle: 'System Administrator',
            studentId: '001',
            status: 'approved',
        },
        { 
            id: 'student-user', 
            username: 'student', 
            role: 'student', 
            password: 'student@123', 
            fullName: 'Jane Doe', 
            email: 'jane.doe@campusflow.app', 
            dateJoined: new Date().toISOString(), 
            avatarUrl: 'https://i.pravatar.cc/150?u=student',
            department: 'Information Technology',
            yearOfStudy: '2',
            section: 'B',
            sectionId: 'sec-it-b-2',
            studentId: 'S2022001',
            status: 'approved',
        },
        {
            id: 'faculty-ds',
            username: 'prof.ds',
            role: 'faculty',
            password: 'password',
            fullName: 'Dr. Evelyn Reed',
            email: 'e.reed@campusflow.app',
            jobTitle: 'Professor',
            department: 'Computer Science',
            avatarUrl: 'https://i.pravatar.cc/150?u=faculty-ds',
            status: 'approved',
        },
        {
            id: 'faculty-os',
            username: 'prof.os',
            role: 'faculty',
            password: 'password',
            fullName: 'Dr. Samuel Chen',
            email: 's.chen@campusflow.app',
            jobTitle: 'Associate Professor',
            department: 'Computer Science',
            avatarUrl: 'https://i.pravatar.cc/150?u=faculty-os',
            status: 'approved',
        },
        {
            id: 'faculty-web',
            username: 'prof.web',
            role: 'faculty',
            password: 'password',
            fullName: 'Dr. Aisha Khan',
            email: 'a.khan@campusflow.app',
            jobTitle: 'Assistant Professor',
            department: 'Information Technology',
            avatarUrl: 'https://i.pravatar.cc/150?u=faculty-web',
            status: 'approved',
        },
         {
            id: 'faculty-db',
            username: 'prof.db',
            role: 'faculty',
            password: 'password',
            fullName: 'Dr. Ben Carter',
            email: 'b.carter@campusflow.app',
            jobTitle: 'Professor',
            department: 'Information Technology',
            avatarUrl: 'https://i.pravatar.cc/150?u=faculty-db',
            status: 'approved',
        },
         {
            id: 'faculty-cn',
            username: 'prof.cn',
            role: 'faculty',
            password: 'password',
            fullName: 'Dr. Olivia Martinez',
            email: 'o.martinez@campusflow.app',
            jobTitle: 'Lecturer',
            department: 'Computer Science',
            avatarUrl: 'https://i.pravatar.cc/150?u=faculty-cn',
            status: 'approved',
        }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
}


// Helper to store users in localStorage
const setStoredUsers = (users: User[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect now only handles session restoration and admin login
    const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionJson) {
        try {
            const sessionUser = JSON.parse(sessionJson);
            setUser(sessionUser);
        } catch (error) {
            setUser(null);
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Auth not initialized");
    
    const users = getStoredUsers();
    const potentialUser = users.find(u => u.email === email || u.username === email);

    if (!potentialUser) {
        throw new Error("User not found. Please check your credentials or sign up.");
    }

    if (potentialUser.status !== 'approved') {
        const message = potentialUser.status === 'pending'
            ? 'Your account is pending approval.'
            : 'Your account has been rejected.';
        throw new Error(message);
    }
    
    // Since we don't have a real backend, we'll simulate password check
    if (potentialUser.password !== password) {
        throw new Error("Invalid password.");
    }
    // If password matches, we set the session
    setUser(potentialUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(potentialUser));
    router.push('/');
  };

  const signup = async (data: SignupData): Promise<void> => {
    const { email, username } = data;
  
    const users = getStoredUsers();
    if (users.some(u => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    if (users.some(u => u.username === username)) {
      throw new Error("This username is already taken. Please choose another one.");
    }
  
    // Create the user profile for local storage with a pending status
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}-${Math.random()}`, // Create a unique ID
      dateJoined: new Date().toISOString(),
      status: 'pending',
    };
    
    const updatedUsers = [...users, newUser];
    setStoredUsers(updatedUsers);
  };
  
  const logout = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    // No need to call signOut(auth) if not using firebase session persistence for all users
    router.push('/login');
  };
  
  const updateUser = async (data: Partial<Omit<User, 'id' | 'username' | 'role' | 'password'>>): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!user) {
            return reject(new Error("No user is logged in to update."));
        }
        setTimeout(() => {
            const users = getStoredUsers();
            const userIndex = users.findIndex(u => u.id === user.id);

            if (userIndex > -1) {
                const updatedUser = { ...users[userIndex], ...data };
                users[userIndex] = updatedUser;
                setStoredUsers(users);

                setUser(updatedUser);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
                resolve();
            } else {
                reject(new Error("Could not find user to update."));
            }
        }, 300);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, updateUser }}>
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
