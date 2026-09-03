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

import { api } from '../lib/api';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const baseAccount = firebaseUserToAccount(firebaseUser);
        setUser(baseAccount);
        // Sync with backend PostgreSQL/SQLite database
        try {
          const syncRes = await api.auth.sync({
            name: baseAccount.displayName,
            profilePicture: baseAccount.avatarUrl,
          });
          if (syncRes && syncRes.success && syncRes.data?.user) {
            const dbUser = syncRes.data.user;
            setUser({
              uid: firebaseUser.uid,
              id: dbUser.id,
              email: dbUser.email || baseAccount.email,
              displayName: dbUser.name || baseAccount.displayName,
              organization: dbUser.organization,
              role: dbUser.role || 'EMPLOYEE',
              bio: dbUser.bio,
              status: dbUser.status,
              level: dbUser.level,
              xp: dbUser.xp,
              avatarUrl: dbUser.profilePicture || baseAccount.avatarUrl,
              permissions: syncRes.data.permissions || [],
            });
          }
        } catch (e) {
          console.warn('[AuthContext] Backend sync note:', e);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginWithEmail(email, password);
    try {
      const syncRes = await api.auth.sync({
        name: res.displayName,
        profilePicture: res.avatarUrl,
      });
      if (syncRes && syncRes.success && syncRes.data?.user) {
        const dbUser = syncRes.data.user;
        const fullAccount: UserAccount = {
          ...res,
          id: dbUser.id,
          displayName: dbUser.name || res.displayName,
          organization: dbUser.organization,
          role: dbUser.role || 'EMPLOYEE',
          bio: dbUser.bio,
          status: dbUser.status,
          level: dbUser.level,
          xp: dbUser.xp,
          avatarUrl: dbUser.profilePicture || res.avatarUrl,
          permissions: syncRes.data.permissions || [],
        };
        setUser(fullAccount);
        return fullAccount;
      }
    } catch (e) {}
    return res;
  };

  const register = async (data: Parameters<typeof registerWithEmail>[0]) => {
    const res = await registerWithEmail(data);
    try {
      const syncRes = await api.auth.sync({
        name: `${data.firstName} ${data.lastName}`,
        organization: data.organization,
        role: data.role || 'EMPLOYEE',
      });
      if (syncRes && syncRes.success && syncRes.data?.user) {
        const dbUser = syncRes.data.user;
        const fullAccount: UserAccount = {
          ...res,
          id: dbUser.id,
          role: dbUser.role || data.role || 'EMPLOYEE',
          organization: dbUser.organization || data.organization,
          bio: dbUser.bio,
          status: dbUser.status,
          permissions: syncRes.data.permissions || [],
        };
        setUser(fullAccount);
        return fullAccount as any;
      }
    } catch (e) {}
    return res;
  };

  const loginProvider = async (providerName?: string) => {
    const res = await loginWithProvider(providerName);
    try {
      const syncRes = await api.auth.sync({
        name: res.displayName,
        organization: res.organization,
        profilePicture: res.avatarUrl,
      });
      if (syncRes && syncRes.success && syncRes.data?.user) {
        const dbUser = syncRes.data.user;
        const fullAccount: UserAccount = {
          ...res,
          id: dbUser.id,
          role: dbUser.role || 'EMPLOYEE',
          organization: dbUser.organization,
          bio: dbUser.bio,
          status: dbUser.status,
          permissions: syncRes.data.permissions || [],
        };
        setUser(fullAccount);
        return fullAccount;
      }
    } catch (e) {}
    return res;
  };

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
