// InvestWise - A modern stock trading and investment education platform for young investors

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
  verifyPasswordResetCode,
  getAdditionalUserInfo,
  confirmPasswordReset,
  type AuthProvider as FirebaseAuthProvider,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { isSessionVerified, requestVerificationCode } from "@/lib/two-factor-client";
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
  /**
   * Whether this sign-in session has passed the email code check.
   * `null` while signed out or still being checked.
   */
  twoFactorVerified: boolean | null;
  /** Call after a code is accepted: picks up the verified session and sets up the profile. */
  completeTwoFactor: () => Promise<boolean>;
  isTokenReady: boolean;
  signUp: (email: string, pass: string, username: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, photoURL?: string }) => Promise<void>;
  updateUserTheme: (themeData: { theme?: Theme, isClearMode?: boolean, primaryColor?: string, sidebarOrientation?: 'left' | 'right' }) => Promise<void>;
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
    sidebarOrientation: "left",
    leaderboardVisibility: "public",
    showQuests: true,
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
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

  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [twoFactorVerified, setTwoFactorVerified] = useState<boolean | null>(null);
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
      // Work out whether this session has passed the email code *before*
      // publishing the user, so nothing ever renders as signed in-and-trusted
      // for a frame and then snaps back.
      const verified = firebaseUser ? await isSessionVerified(firebaseUser).catch(() => false) : null;

      setUser(firebaseUser);
      setTwoFactorVerified(verified);
      setIsTokenReady(!!firebaseUser);
      if (!firebaseUser) resetAllStores();

      setHydrating(false);
      hideLoading();
    });

    return () => unsubscribe();
  }, [hideLoading, resetAllStores]);

  // The gate. Runs on every navigation, in every tab:
  //  - signed out on an account page → sign in;
  //  - signed in but this session hasn't entered its email code → the code
  //    screen, and back to where they were going once it's entered.
  // Public pages (the landing page, privacy) and the sign-in steps themselves
  // are always reachable.
  useEffect(() => {
    if (hydrating) return;
    const path = pathname ?? "/";
    const isPublic = path === "/" || path.startsWith("/landing") || path.startsWith("/privacy");
    const isSignInStep = ["/auth/signin", "/auth/signup", "/auth/verify-code", "/auth/reset-password"].some(
      (step) => path.startsWith(step)
    );

    if (!user) {
      if (!isPublic && !path.startsWith("/auth")) router.replace("/auth/signin");
      return;
    }
    if (twoFactorVerified !== true && !isPublic && !isSignInStep) {
      const returnTo = `${path}${window.location.search}`;
      router.replace(`/auth/verify-code?redirect=${encodeURIComponent(returnTo)}&send=1`);
    }
  }, [hydrating, user, twoFactorVerified, pathname, router]);

  const completeTwoFactor = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return false;
    // A fresh token carries the verification stamp the server just wrote.
    const verified = await isSessionVerified(current, true).catch(() => false);
    if (!verified) return false;

    // The profile is only created now, once the account is proven: a password
    // alone never gets as far as writing to the database.
    const pendingUsername =
      typeof window !== "undefined" ? sessionStorage.getItem("pendingUsername") ?? undefined : undefined;
    await initializeUserDocument(current, { username: pendingUsername });
    if (typeof window !== "undefined") sessionStorage.removeItem("pendingUsername");

    setTwoFactorVerified(true);
    return true;
  }, []);

  const signUp = async (email: string, pass: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: username });
      // The profile document is written once the email code is entered.
      sessionStorage.setItem("pendingUsername", username);

      await requestVerificationCode(userCredential.user);

      toast({ title: "Account Created!", description: "A verification code has been sent to your email." });
      router.push(`/auth/verify-code?redirect=${encodeURIComponent("/onboarding/quiz")}`);
    } catch (error: any) {
      hideLoading();
      throw error;
    }
  };

  const signIn = async (email: string, pass: string) => {
    showLoading();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);

      // The password only opens the door halfway: this session still needs
      // the code emailed to the account.
      await requestVerificationCode(userCredential.user);

      hideLoading();
      toast({ title: "Verification Required", description: "A verification code has been sent to your email." });
      router.push(`/auth/verify-code?redirect=${encodeURIComponent("/auth/welcome-back")}`);
    } catch (error: any) {
      hideLoading();
      throw error;
    }
  };

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
    showLoading();
    try {
      const result = await signInWithPopup(auth, provider);
      const isNew = getAdditionalUserInfo(result)?.isNewUser ?? false;

      if (!result.user.email) {
        throw new Error('No email associated with this account');
      }

      // Google sign-in gets the same second step as a password.
      await requestVerificationCode(result.user);

      hideLoading();
      const redirectTo = isNew ? '/onboarding/quiz' : '/auth/welcome-back';
      toast({ title: "Verification Required", description: "A verification code has been sent to your email." });
      router.push(`/auth/verify-code?redirect=${encodeURIComponent(redirectTo)}`);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user.");
        hideLoading();
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
        hideLoading();
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

  const updateUserTheme = async (themeData: { theme?: Theme, isClearMode?: boolean, primaryColor?: string, sidebarOrientation?: 'left' | 'right' }) => {
    if (!user) return;

    const updateData: { [key: string]: any } = {};
    if (themeData.theme !== undefined) updateData.theme = themeData.theme;
    if (themeData.isClearMode !== undefined) updateData.isClearMode = themeData.isClearMode;
    if (themeData.primaryColor !== undefined) updateData.primaryColor = themeData.primaryColor;
    if (themeData.sidebarOrientation !== undefined) updateData.sidebarOrientation = themeData.sidebarOrientation;

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

  const handleVerifyPasswordResetCode = async (code: string) => {
    return await verifyPasswordResetCode(auth, code);
  };

  const handleConfirmPasswordReset = async (code: string, newPassword: string) => {
    await confirmPasswordReset(auth, code, newPassword);
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
        twoFactorVerified,
        completeTwoFactor,
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
        verifyPasswordResetCode: handleVerifyPasswordResetCode,
        confirmPasswordReset: handleConfirmPasswordReset,
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
 