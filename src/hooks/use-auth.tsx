
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase'; // Import the initialized app
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth
} from "firebase/auth";

const USERS_STORAGE_KEY = 'campus-flow-users';
const SESSION_STORAGE_KEY = 'campus-flow-session';


interface User {
  id: string;
  username: string;
  role: 'student' | 'faculty' | 'admin';
  password? : string; // In a real app, this would be a hash
  fullName?: string;
  email?: string;
  dateJoined?: string;
  avatarUrl?: string;
  department?: string;
  yearOfStudy?: string;
  studentId?: string;
  jobTitle?: string;
}

type SignupData = Omit<User, 'id' | 'dateJoined'>;

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
            // Default admin user might not have a proper ID, so ensure it does
            return parsed.map((u: User) => u.username === 'admin' && !u.id ? {...u, id: 'admin-user'} : u);
        } catch (e) {
            console.error("Failed to parse users from localStorage", e);
            return [];
        }
    }
    // Add default admin user if no users exist
    const adminUser: User = { 
        id: 'admin-user', 
        username: 'admin', 
        role: 'admin', 
        password: 'admin@123', 
        fullName: 'Admin User', 
        email: 'admin@campusflow.app', 
        dateJoined: new Date().toISOString(), 
        avatarUrl: '',
        jobTitle: 'System Administrator',
        studentId: '001'
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
    return [adminUser];
}

// Helper to store users in localStorage
const setStoredUsers = (users: User[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
}

const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser): User => {
    const username = firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0,5)}`;
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || username,
        username: username,
        avatarUrl: firebaseUser.photoURL || '',
        dateJoined: firebaseUser.metadata.creationTime || new Date().toISOString(),
        role: 'student', // Default role for new signups
        studentId: `G-${firebaseUser.uid.substring(0,8)}`, // Placeholder ID
        department: '',
        yearOfStudy: '',
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // Initialize auth directly. Since this is a client component, `getAuth` will run on the client.
  const auth = getAuth(app); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const users = getStoredUsers();
            const appUser = users.find(u => u.id === firebaseUser.uid);
            if (appUser) {
                setUser(appUser);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
            } else {
                 const newAppUser = mapFirebaseUserToAppUser(firebaseUser);
                 const newUsersList = [...users, newAppUser];
                 setStoredUsers(newUsersList);
                 setUser(newAppUser);
                 localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newAppUser));
            }
        } else {
            const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionJson) {
                try {
                    const sessionUser = JSON.parse(sessionJson);
                     if (sessionUser.username !== 'admin') {
                       localStorage.removeItem(SESSION_STORAGE_KEY);
                       setUser(null);
                    } else {
                       setUser(sessionUser)
                    }
                } catch (error) {
                    setUser(null);
                    localStorage.removeItem(SESSION_STORAGE_KEY);
                }
            } else {
                setUser(null);
            }
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string): Promise<void> => {
    if ((email === 'admin' || email === 'admin@campusflow.app') && password === 'admin@123') {
        const users = getStoredUsers();
        const adminUser = users.find(u => u.username === 'admin');
        if (adminUser) {
            setUser(adminUser);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
            router.push('/');
            return;
        }
    }
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/');
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        if (!firebaseUser.email || !firebaseUser.email.endsWith('@mlrit.ac.in')) {
            await signOut(auth);
            throw new Error("Only institutional accounts (@mlrit.ac.in) are allowed.");
        }
        
        const allUsers = getStoredUsers();
        let appUser = allUsers.find(u => u.id === firebaseUser.uid);
      
        if (!appUser) {
            appUser = mapFirebaseUserToAppUser(firebaseUser);
            allUsers.push(appUser);
            setStoredUsers(allUsers);
        }
        
        setUser(appUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
        router.push('/');
    } catch (error: any) {
        if (auth.currentUser) {
            await signOut(auth);
        }
        setUser(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        throw error;
    }
  }

  const signup = async (data: SignupData): Promise<void> => {
      const {email, password, ...restData} = data;
      if (!email || !password) throw new Error("Email and password are required for signup.");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
          ...restData,
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          dateJoined: new Date().toISOString(),
          avatarUrl: '',
      };
      
      const users = getStoredUsers();
      const updatedUsers = [...users, newUser];
      setStoredUsers(updatedUsers);
  };

  const logout = async () => {
    if (auth.currentUser) {
        await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
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
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading, updateUser }}>
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
