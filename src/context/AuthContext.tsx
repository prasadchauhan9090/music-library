import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/music';

const OWNER_EMAIL = 'prasadchauhan99@gmail.com';

interface AuthContextType {
  user: User | null;
  isOwner: boolean;
  loginAs: (email: string, name: string) => void;
  logout: () => void;
  storageUsedBytes: number;
  updateStorageUsed: (bytes: number) => void;
  verifyOwnerPin: (pin: string) => boolean;
}

const DEFAULT_USER: User = {
  id: 'user_prasad',
  email: OWNER_EMAIL,
  name: 'Prasad Chauhan (Owner)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  storageLimitBytes: 50 * 1024 * 1024 * 1024, // 50 GB
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('maara_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [storageUsedBytes, setStorageUsedBytes] = useState<number>(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem('maara_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('maara_user');
    }
  }, [user]);

  const isOwner = user?.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const loginAs = (email: string, name: string) => {
    const newUser: User = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name,
      avatarUrl: email === OWNER_EMAIL 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      storageLimitBytes: email === OWNER_EMAIL ? 50 * 1024 * 1024 * 1024 : 5 * 1024 * 1024 * 1024,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateStorageUsed = (bytes: number) => {
    setStorageUsedBytes(bytes);
  };

  const verifyOwnerPin = (pin: string) => {
    if (pin === '7777' || pin === '9090' || pin.toLowerCase() === 'maara') {
      loginAs(OWNER_EMAIL, 'Prasad Chauhan (Owner)');
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isOwner,
        loginAs,
        logout,
        storageUsedBytes,
        updateStorageUsed,
        verifyOwnerPin,
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
