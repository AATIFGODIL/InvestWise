
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyPasswordResetCode,
  confirmPasswordReset,
  type AuthProvider as FirebaseAuthProvider,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useGoalStore } from "@/store/goal-store";
import { useAutoInvestStore } from "@/store/auto-invest-store";
import { useThemeStore, type Theme } from "@/store/theme-store";
import { usePrivacyStore, type PrivacyState } from "@/store/privacy-store";
import useLoadingStore from "@/store/loading-store";
import { useToast } from "./use-toast";
import { useWatchlistStore } from "@/store/watchlist-store";
import { useTransactionStore } from "@/store/transaction-store";

// This file provides a centralized authentication context for the entire application.
// It handles user sign-up, sign-in, sign-out, and session management.

interface AuthContextType {
  user: User | null;
  hydrating: boolean;
  isTokenReady: boolean;
  signUp: (email: string, pass: string, username: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, photoURL?: string }) => Promise<void>;
  updateUserTheme: (themeData: { theme?: Theme, isClearMode?: boolean }) => Promise<void>;
  updatePrivacySettings: (settings: Partial<Omit<PrivacyState, 'setLeaderboardVisibility' | 'setShowQuests' | 'loadPrivacySettings' | 'resetPrivacySettings'>>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<string | null>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Creates a new user document in Firestore upon first sign-up.
 * This function is idempotent, meaning it won't overwrite an existing user document.
 * @param user - The Firebase Auth user object.
 * @param additionalData - Optional data, like a username from the sign-up form.
 * @returns {Promise<{ isNew: boolean }>} - An object indicating if a new user was created.
 */
const initializeUserDocument = async (user: User, additionalData: { username?: string } = {}) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { isNew: false };
  }

  const displayName = additionalData.username || user.displayName || "Investor";

  // This is the default data structure for a new user in Firestore.
  const newUserDoc = {
    uid: user.uid,
    email: user.email,
    username: displayName,
    photoURL: user.photoURL || "",
    theme: "light",
    isClearMode: false,
    leaderboardVisibility: "public",
    showQuests: true,
    createdAt: new Date(),
    portfolio: {
      holdings: [],
      summary: { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 },
    },
    notifications: [],
    goals: [],
    autoInvestments: [],
    watchlist: [],
    transactions: [],
  };

  await setDoc(userDocRef, newUserDoc);

  // Sync the display name and photo URL with Firebase Auth profile.
  if (auth.currentUser && (auth.currentUser.displayName !== displayName || auth.currentUser.photoURL !== user.photoURL)) {
    await updateProfile(auth.currentUser, { displayName, photoURL: user.photoURL || "" });
  }

  return { isNew: true };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoadingStore();

  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [isTokenReady, setIsTokenReady] = useState(false);

  // This function resets all user-related state in Zustand stores.
  // It's called on sign-out to ensure no data leaks between sessions.
  const resetAllStores = useCallback(() => {
    useUserStore.getState().reset();
    usePortfolioStore.getState().resetPortfolio();
    useGoalStore.getState().resetGoals();
    useAutoInvestStore.getState().resetAutoInvest();
    useThemeStore.getState().setTheme("light");
    useThemeStore.getState().setClearMode(false);
    usePrivacyStore.getState().resetPrivacySettings();
    useWatchlistStore.getState().resetWatchlist();
    useTransactionStore.getState().resetTransactions();
  }, []);


  useEffect(() => {
    // This listener is the core of the session management. It fires whenever
    // the user's authentication state changes.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsTokenReady(!!firebaseUser);

      if (!firebaseUser) {
        // If the user signs out, reset all stores and redirect to the sign-in page.
        resetAllStores();
        const isProtectedPage = !window.location.pathname.startsWith('/auth');
        if (isProtectedPage) {
          router.push('/auth/signin');
        }
      }
      
      setHydrating(false);
      hideLoading();
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, pass: string, username: string) => {
    showLoading();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(userCredential.user);
      await initializeUserDocument(userCredential.user, { username });
      toast({ title: "Account Created!", description: "A verification email has been sent to your inbox." });
      router.push('/onboarding/quiz');
    } catch (error: any) {
      hideLoading();
      throw error;
    }
  };

  const signIn = async (email: string, pass: string) => {
    showLoading();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Signed In Successfully", description: "Welcome back!" });
      router.push('/dashboard');
    } catch(error: any) {
      hideLoading();
      throw error;
    }
  };

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
    showLoading();
    try {
        const result = await signInWithPopup(auth, provider);
        const { isNew } = await initializeUserDocument(result.user);
        
        // Direct new users to the onboarding flow and existing users to the dashboard.
        if (isNew) {
            toast({ title: "Account Created!", description: "Your email is verified. Let's get you started." });
            router.push('/onboarding/quiz');
        } else {
            toast({ title: "Signed In Successfully", description: "Welcome back!" });
            router.push('/dashboard');
        }
    } catch (error: any) {
      hideLoading();
      console.error("Popup sign-in failed:", error);
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: error.code === 'auth/popup-closed-by-user' 
            ? "The sign-in window was closed. Please try again."
            : error.message || "An unknown error occurred.",
        });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleSocialSignIn(provider);
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    await handleSocialSignIn(provider);
  };

  // Updates the user's profile information in both Firebase Auth and Firestore.
  const updateUserProfile = async (data: { username?: string, photoURL?: string }) => {
    if (!user) throw new Error("User not authenticated.");
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, data);
    await updateProfile(user, data);
  };

  // Persists the user's theme preference to Firestore.
  const updateUserTheme = async (themeData: { theme?: Theme, isClearMode?: boolean }) => {
    if ('theme' in themeData && themeData.theme) {
      useThemeStore.getState().setTheme(themeData.theme);
    }
    if ('isClearMode' in themeData && typeof themeData.isClearMode === 'boolean') {
      useThemeStore.getState().setClearMode(themeData.isClearMode);
    }
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, themeData);
  };

  // Persists the user's privacy settings to Firestore.
  const updatePrivacySettings = async (settings: Partial<Omit<PrivacyState, any>>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, settings);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    showLoading();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hydrating,
        isTokenReady,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        updateUserProfile,
        updateUserTheme,
        updatePrivacySettings,
        sendPasswordReset,
        verifyPasswordResetCode,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily access the authentication context.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
