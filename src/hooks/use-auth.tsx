
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
import { useFavoritesStore, type Favorite } from "@/store/favorites-store";

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
  updateUserTheme: (themeData: { theme?: Theme, isClearMode?: boolean, primaryColor?: string }) => Promise<void>;
  updatePrivacySettings: (settings: Partial<Omit<PrivacyState, 'setLeaderboardVisibility' | 'setShowQuests' | 'loadPrivacySettings' | 'resetPrivacySettings'>>) => Promise<void>;
  updateFavorites: (favorites: Favorite[]) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<string | null>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeUserDocument = async (user: User, additionalData: { username?: string } = {}) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { isNew: false };
  }

  const displayName = additionalData.username || user.displayName || "Investor";

  const newUserDoc = {
    uid: user.uid,
    email: user.email,
    username: displayName,
    photoURL: user.photoURL || "",
    theme: "light",
    isClearMode: false,
    primaryColor: "#775DEF", // Default purple color
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
    favorites: [],
  };

  await setDoc(userDocRef, newUserDoc);

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

  const resetAllStores = useCallback(() => {
    useUserStore.getState().reset();
    usePortfolioStore.getState().resetPortfolio();
    useGoalStore.getState().resetGoals();
    useAutoInvestStore.getState().resetAutoInvest();
    useThemeStore.getState().resetTheme();
    usePrivacyStore.getState().resetPrivacySettings();
    useWatchlistStore.getState().resetWatchlist();
    useTransactionStore.getState().resetTransactions();
    useFavoritesStore.getState().resetFavorites();
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsTokenReady(!!firebaseUser);

      if (!firebaseUser) {
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
  }, [router, hideLoading, resetAllStores]);

  const signUp = async (email: string, pass: string, username: string) => {
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
      router.push('/auth/welcome-back');
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
        
        if (isNew) {
            toast({ title: "Account Created!", description: "Your email is verified. Let's get you started." });
            router.push('/onboarding/quiz');
        } else {
            router.push('/auth/welcome-back');
        }
    } catch (error: any) {
      // Don't hide loading here. onAuthStateChanged will handle it.
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user.");
        hideLoading(); // Only hide loading if the user intentionally closes it.
        toast({
            title: "Sign-in Cancelled",
            description: "The sign-in window was closed. Please try again.",
        });
      } else {
        console.error("Popup sign-in failed:", error);
          toast({
              variant: "destructive",
              title: "Sign In Failed",
              description: error.message || "An unknown error occurred.",
          });
          hideLoading(); // Hide loading on other unexpected errors.
      }
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

  const updateUserProfile = async (data: { username?: string, photoURL?: string }) => {
    if (!user) throw new Error("User not authenticated.");
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, data);
    await updateProfile(user, data);
  };

  const updateUserTheme = async (themeData: { theme?: Theme, isClearMode?: boolean, primaryColor?: string }) => {
    if (!user) return;
    
    const updateData: { [key: string]: any } = {};
    if (themeData.theme !== undefined) updateData.theme = themeData.theme;
    if (themeData.isClearMode !== undefined) updateData.isClearMode = themeData.isClearMode;
    if (themeData.primaryColor !== undefined) updateData.primaryColor = themeData.primaryColor;

    if (Object.keys(updateData).length > 0) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updateData);
    }
  };

  const updatePrivacySettings = async (settings: Partial<Omit<PrivacyState, any>>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, settings);
  };

  const updateFavorites = async (favorites: Favorite[]) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { favorites });
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
        updateFavorites,
        sendPasswordReset,
        verifyPasswordResetCode,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
