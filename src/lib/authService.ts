import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

// ── Local avatar override (stored in localStorage so it persists) ─────────────
const AVATAR_KEY = 'cg_avatar_override';

export function getLocalAvatar(uid: string): string | null {
  return localStorage.getItem(`${AVATAR_KEY}_${uid}`);
}

export function setLocalAvatar(uid: string, dataUrl: string | null): void {
  if (dataUrl) {
    localStorage.setItem(`${AVATAR_KEY}_${uid}`, dataUrl);
  } else {
    localStorage.removeItem(`${AVATAR_KEY}_${uid}`);
  }
}

// ── Shared user shape ─────────────────────────────────────────────────────────
export interface UserAccount {
  uid: string;
  id?: string;
  email: string;
  displayName: string;
  organization?: string;
  role?: string;
  bio?: string;
  status?: string;
  level?: number;
  xp?: number;
  avatarUrl?: string;
  permissions?: string[];
}

export function firebaseUserToAccount(user: FirebaseUser): UserAccount {
  // Local override takes priority over Google/Firebase photo
  const localAvatar = getLocalAvatar(user.uid);
  return {
    uid:         user.uid,
    email:       user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    avatarUrl:   localAvatar ?? user.photoURL ?? undefined,
  };
}

// ── Change password (requires re-auth) ────────────────────────────────────────
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ── Email / Password ──────────────────────────────────────────────────────────
export async function loginWithEmail(
  email: string,
  password: string = '',
): Promise<UserAccount> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return firebaseUserToAccount(cred.user);
}

export async function registerWithEmail(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role?: string;
}): Promise<UserAccount> {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await updateProfile(cred.user, {
    displayName: `${data.firstName} ${data.lastName}`,
  });
  return firebaseUserToAccount(cred.user);
}

// ── OAuth Providers ───────────────────────────────────────────────────────────
const googleProvider    = new GoogleAuthProvider();
const githubProvider    = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Request extra scopes so we get name/email/avatar from each provider
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');
microsoftProvider.addScope('user.read');

export async function loginWithProvider(
  providerName: string = 'google',
): Promise<UserAccount> {
  let provider;
  switch (providerName) {
    case 'google':    provider = googleProvider;    break;
    case 'github':    provider = githubProvider;    break;
    case 'microsoft': provider = microsoftProvider; break;
    default:
      throw Object.assign(
        new Error('Provider not configured yet'),
        { code: 'auth/provider-not-configured' },
      );
  }
  const cred = await signInWithPopup(auth, provider);
  return firebaseUserToAccount(cred.user);
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function resetPassword(email: string): Promise<boolean> {
  await sendPasswordResetEmail(auth, email);
  return true;
}

export function friendlyAuthError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':       return 'No account found with this email.';
    case 'auth/wrong-password':       return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':   return 'Incorrect email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password':        return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user': return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request': return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':        return 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
    case 'auth/provider-not-configured': return 'This sign-in provider is not available yet.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Try signing in with the original method.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please check Firebase Console.';
    case 'auth/unauthorized-domain':
      if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || !window.location.hostname || (window as any).electronAPI)) {
        return 'Google OAuth popup is blocked inside Electron desktop app. Please use Email & Password or open the app in a browser (http://localhost:5173).';
      }
      return 'This domain is not authorised for OAuth sign-in. Check Firebase Console → Authorised Domains.';
    default: return 'Authentication failed. Please check your credentials.';
  }
}
