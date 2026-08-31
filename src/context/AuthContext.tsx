import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithProvider,
  logoutUser,
  firebaseUserToAccount,
  setLocalAvatar,
} from '../lib/authService';
import type { UserAccount } from '../lib/authService';

interface AuthContextType {
  user: UserAccount | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<UserAccount>;
  register: typeof registerWithEmail;
  loginProvider: (providerName?: string) => Promise<UserAccount>;
  logout: () => Promise<void>;
  updateAvatar: (dataUrl: string) => void;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Firebase fires this immediately with the current session,
    // then again on every login / logout / token refresh — real-time.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUserToAccount(firebaseUser) : null);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, password: string) =>
    loginWithEmail(email, password);

  const register = (data: Parameters<typeof registerWithEmail>[0]) =>
    registerWithEmail(data);

  const loginProvider = (providerName?: string) =>
    loginWithProvider(providerName);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateAvatar = (dataUrl: string) => {
    if (!user) return;
    setLocalAvatar(user.uid, dataUrl);
    setUser((prev) => prev ? { ...prev, avatarUrl: dataUrl } : prev);
  };

  const updateDisplayName = async (name: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
    setUser((prev) => prev ? { ...prev, displayName: name } : prev);
  };

  // Don't render children until Firebase has resolved the initial session
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, loginProvider, logout, updateAvatar, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
