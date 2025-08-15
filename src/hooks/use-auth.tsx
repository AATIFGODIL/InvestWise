
"use client";

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
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  type AuthProvider as FirebaseAuthProvider,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc, type Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore, { type Notification } from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";
import usePrivacyStore, { type PrivacyState } from "@/store/privacy-store";
import useLoadingStore from "@/store/loading-store";
import { useToast } from "./use-toast";

interface AuthContextType {
  user: User | null;
  hydrating: boolean;
  isTokenReady: boolean; // New state to signal when auth is fully ready
  signUp: (email:string, pass: string, username: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string }) => Promise<void>;
  updateUserTheme: (theme: "light" | "dark") => Promise<void>;
  updatePrivacySettings: (settings: Partial<Omit<PrivacyState, 'setLeaderboardVisibility' | 'setShowQuests' | 'loadPrivacySettings' | 'resetPrivacySettings'>>) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeUserDocument = async (user: User, additionalData: { username?: string } = {}) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const existingData = userDoc.data();
        return existingData;
    }

    const displayName = additionalData.username || user.displayName || "Investor";
    const welcomeNotification: Notification = {
        id: `welcome-${Date.now()}`,
        title: "Welcome to InvestWise!",
        description: "We're glad to have you. Explore the app to start your journey.",
        href: "/dashboard",
        type: 'welcome',
        read: false,
        createdAt: new Date().toISOString(),
    };
    const newUserDoc = {
        uid: user.uid,
        email: user.email,
        username: displayName,
        photoURL: "",
        theme: 'light',
        leaderboardVisibility: 'public',
        showQuests: true,
        createdAt: new Date(),
        portfolio: { holdings: [], summary: { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 } },
        notifications: [welcomeNotification],
        goals: [],
        autoInvestments: [],
    };
    
    await setDoc(userDocRef, newUserDoc);
    
    // Ensure the auth profile display name is consistent with our database.
    if (auth.currentUser && (auth.currentUser.displayName !== displayName)) {
        await updateProfile(auth.currentUser, { displayName });
    }
    
    return newUserDoc;
};


const fetchAndHydrateUserData = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.data();
    if (!userData) {
        console.error("Failed to fetch user data for hydration.");
        return false;
    }

    // Batch all state updates for efficiency
    const { setUsername } = useUserStore.getState();
    const { loadInitialData } = usePortfolioStore.getState();
    const { setNotifications } = useNotificationStore.getState();
    const { loadGoals } = useGoalStore.getState();
    const { loadAutoInvestments } = useAutoInvestStore.getState();
    const { setTheme } = useThemeStore.getState();
    const { loadPrivacySettings } = usePrivacyStore.getState();
    
    const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
    const theme = userData.theme || 'light';
    
    // Apply theme first to prevent flash of default theme
    setTheme(theme);
    
    setUsername(userData.username || user.displayName || "Investor");
    loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
    setNotifications(userData.notifications || []);
    loadGoals(userData.goals || []);
    loadAutoInvestments(userData.autoInvestments || []);
    loadPrivacySettings({
        leaderboardVisibility: userData.leaderboardVisibility || 'public',
        showQuests: userData.showQuests === undefined ? true : userData.showQuests,
    });
    
    return true;
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoadingStore();
  
  const { reset: resetUserStore } = useUserStore.getState();
  const { resetPortfolio } = usePortfolioStore.getState();
  const { setNotifications } = useNotificationStore.getState();
  const { resetGoals } = useGoalStore.getState();
  const { resetAutoInvest } = useAutoInvestStore.getState();
  const { setTheme } = useThemeStore.getState();
  const { resetPrivacySettings } = usePrivacyStore.getState();
  
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [isTokenReady, setIsTokenReady] = useState(false);
  
  const resetAllStores = useCallback(() => {
    resetUserStore();
    resetPortfolio();
    setNotifications([]);
    resetGoals();
    resetAutoInvest();
    setTheme('light');
    resetPrivacySettings();
  }, [resetUserStore, resetPortfolio, setNotifications, resetGoals, resetAutoInvest, setTheme, resetPrivacySettings]);


  useEffect(() => {
    // This effect handles the result of a social sign-in redirect.
    // It runs once when the component mounts.
    const processRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                // User has successfully signed in via redirect.
                // We MUST ensure their document exists *before* onAuthStateChanged hydrates.
                await initializeUserDocument(result.user);
                toast({
                    title: "Signed In Successfully",
                    description: "Welcome back!",
                });
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Error during redirect sign-in:", error);
            toast({
                variant: "destructive",
                title: "Sign In Failed",
                description: error.message,
            });
        }
    };
    processRedirectResult();
  }, [router, toast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setHydrating(true);
      setIsTokenReady(false); // Reset token readiness on auth change
      if (firebaseUser) {
        setUser(firebaseUser);
        const hydrated = await fetchAndHydrateUserData(firebaseUser);
        setIsTokenReady(hydrated); // Token is ready only after user data is loaded
      } else {
        setUser(null);
        resetAllStores();
        setIsTokenReady(false); // No user, so no token
      }
      setHydrating(false);
      hideLoading();
    });

    return () => unsubscribe();
  }, [resetAllStores, hideLoading]);


  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    // We update the auth profile first so the displayName is available for initializeUserDocument
    await updateProfile(newUser, { displayName: username });
    await initializeUserDocument(newUser, { username });
  }

  const signIn = async (email:string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
    showLoading(); // Show loading indicator before redirecting
    await signInWithRedirect(auth, provider);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleSocialSignIn(provider);
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    await handleSocialSignIn(provider);
  };
  
  const updateUserProfile = async (data: { username?: string }) => {
    if (!user) throw new Error("User not authenticated.");

    const userDocRef = doc(db, "users", user.uid);
    const updatesForFirestore: { [key: string]: any } = {};
    const updatesForAuth: { displayName?: string } = {};
    const { setUsername } = useUserStore.getState();

    if (data.username && data.username !== user.displayName) {
        updatesForFirestore.username = data.username;
        updatesForAuth.displayName = data.username;
    }
    
    if (Object.keys(updatesForFirestore).length > 0) {
        await updateDoc(userDocRef, updatesForFirestore);
    }
    
    if (Object.keys(updatesForAuth).length > 0) {
        await updateProfile(user, updatesForAuth);
    }

    if (updatesForAuth.displayName) {
        setUsername(updatesForAuth.displayName);
    }
  };

  const updateUserTheme = async (theme: "light" | "dark") => {
    useThemeStore.getState().setTheme(theme);
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { theme });
  }
  
  const updatePrivacySettings = async (settings: Partial<Omit<PrivacyState, 'setLeaderboardVisibility' | 'setShowQuests' | 'loadPrivacySettings' | 'resetPrivacySettings'>>) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, settings);
  }

  const sendPasswordReset = async () => {
    if (!user?.email) throw new Error("No email associated with user.");
    await sendPasswordResetEmail(auth, user.email);
  }

  const signOut = async () => {
    showLoading();
    await firebaseSignOut(auth);
    router.push('/auth/signin');
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
