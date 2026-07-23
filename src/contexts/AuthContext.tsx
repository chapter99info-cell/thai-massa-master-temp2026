import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  User as FirebaseUser,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Customer } from '../types';
import { computeTier, pointsForSpend, pointsToDollarValue, generateRedemptionCode } from '../lib/loyalty';

export type CustomerProfile = Customer & { uid: string; email: string };

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: CustomerProfile | null;
  user: FirebaseUser | null; // kept for backward compatibility with existing components
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  sendEmailLoginLink: (email: string) => Promise<void>;
  /** Call once on app load; completes an email-link sign-in if the current URL is one. */
  completeEmailLinkSignInIfPresent: () => Promise<boolean>;
  logout: () => Promise<void>;
  /** Adds points for a completed booking/sale and recomputes the customer's tier. */
  earnPoints: (amountSpent: number) => Promise<void>;
  /** Spends a 100-point block for a $10 redemption code. Returns the code, or null if not enough points. */
  redeemPoints: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const EMAIL_LINK_STORAGE_KEY = 'chapter99_email_for_signin';
const ADMIN_EMAILS = ['chapter99info@gmail.com'];

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  profile: null,
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  sendEmailLoginLink: async () => {},
  completeEmailLinkSignInIfPresent: async () => false,
  logout: async () => {},
  earnPoints: async () => {},
  redeemPoints: async () => null,
  refreshProfile: async () => {},
});

async function loadOrCreateProfile(fbUser: FirebaseUser): Promise<CustomerProfile> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: fbUser.uid, ...(snap.data() as any) } as CustomerProfile;
  }

  const newProfile: CustomerProfile = {
    id: fbUser.uid,
    uid: fbUser.uid,
    name: fbUser.displayName || fbUser.email || 'Guest',
    phone: fbUser.phoneNumber || '',
    email: fbUser.email || '',
    memberTier: 'General',
    totalVisits: 0,
    totalSpent: 0,
    points: 0,
    lastVisitDate: new Date().toISOString(),
    authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, {
    uid: newProfile.uid,
    email: newProfile.email,
    displayName: newProfile.name,
    role: 'client',
    createdAt: newProfile.createdAt,
    name: newProfile.name,
    phone: newProfile.phone,
    memberTier: newProfile.memberTier,
    totalVisits: newProfile.totalVisits,
    totalSpent: newProfile.totalSpent,
    points: newProfile.points,
    lastVisitDate: newProfile.lastVisitDate,
    authProvider: newProfile.authProvider,
  });

  return newProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }
    const p = await loadOrCreateProfile(auth.currentUser);
    setProfile(p);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const p = await loadOrCreateProfile(fbUser);
          setProfile(p);
        } catch (err) {
          console.error('Failed to load customer profile', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const sendEmailLoginLink = useCallback(async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/profile',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
  }, []);

  const completeEmailLinkSignInIfPresent = useCallback(async (): Promise<boolean> => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;

    let email = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
    if (!email) {
      email = window.prompt(
        'กรุณายืนยันอีเมลที่ใช้สมัครอีกครั้งค่ะ / Please confirm the email you signed up with'
      );
    }
    if (!email) return false;

    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const earnPoints = useCallback(async (amountSpent: number) => {
    if (!auth.currentUser) return;
    const earned = pointsForSpend(amountSpent);
    if (earned <= 0) return;

    const ref = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data() as any) : {};
    const newTotalSpent = (current.totalSpent || 0) + amountSpent;

    await updateDoc(ref, {
      points: increment(earned),
      totalSpent: newTotalSpent,
      totalVisits: increment(1),
      memberTier: computeTier(newTotalSpent),
      lastVisitDate: new Date().toISOString(),
    });

    await refreshProfile();
  }, [refreshProfile]);

  const redeemPoints = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser || !profile) return null;
    const currentPoints = profile.points || 0;
    if (currentPoints < 100) return null;

    const code = generateRedemptionCode();
    const ref = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(ref, { points: increment(-100) });

    // Log the redemption so staff can verify the code at the counter.
    await setDoc(doc(collection(db, 'pointsRedemptions')), {
      uid: auth.currentUser.uid,
      code,
      valueDollars: pointsToDollarValue(100),
      pointsSpent: 100,
      isUsed: false,
      createdAt: serverTimestamp(),
    });

    await refreshProfile();
    return code;
  }, [profile, refreshProfile]);

  const isAdmin = !!firebaseUser?.email && ADMIN_EMAILS.includes(firebaseUser.email);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        user: firebaseUser,
        loading,
        isAdmin,
        loginWithGoogle,
        sendEmailLoginLink,
        completeEmailLinkSignInIfPresent,
        logout,
        earnPoints,
        redeemPoints,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
