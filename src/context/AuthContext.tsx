import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/music';

interface AuthContextType {
  user: User | null;
  loginAs: (email: string, name: string) => void;
  logout: () => void;
  storageUsedBytes: number;
  updateStorageUsed: (bytes: number) => void;
}

const DEFAULT_USER: User = {
  id: 'user_default',
  email: 'prasadchauhan99@gmail.com',
  name: 'Prasad Chauhan',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  storageLimitBytes: 15 * 1024 * 1024 * 1024,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('antigravity_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [storageUsedBytes, setStorageUsedBytes] = useState<number>(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('antigravity_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('antigravity_user');
    }
  }, [user]);

  const loginAs = (email: string, name: string) => {
    const newUser: User = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      storageLimitBytes: 15 * 1024 * 1024 * 1024,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateStorageUsed = (bytes: number) => {
    setStorageUsedBytes(bytes);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout, storageUsedBytes, updateStorageUsed }}>
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
