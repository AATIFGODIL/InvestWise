
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
  isTokenReady: boolean;
  signUp: (email: string, pass: string, username: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
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
    return { data: userDoc.data(), isNew: false };
  }

  const displayName = additionalData.username || user.displayName || "Investor";
  const welcomeNotification: Notification = {
    id: `welcome-${Date.now()}`,
    title: "Welcome to InvestWise!",
    description: "We're glad to have you. Explore the app to start your journey.",
    href: "/dashboard",
    type: "welcome",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const newUserDoc = {
    uid: user.uid,
    email: user.email,
    username: displayName,
    photoURL: "",
    theme: "light",
    leaderboardVisibility: "public",
    showQuests: true,
    createdAt: new Date(),
    portfolio: {
      holdings: [],
      summary: {
        totalValue: 0,
        todaysChange: 0,
        totalGainLoss: 0,
        annualRatePercent: 0,
      },
    },
    notifications: [welcomeNotification],
    goals: [],
    autoInvestments: [],
  };

  await setDoc(userDocRef, newUserDoc);

  if (auth.currentUser && auth.currentUser.displayName !== displayName) {
    await updateProfile(auth.currentUser, { displayName });
  }

  return { data: newUserDoc, isNew: true };
};

const fetchAndHydrateUserData = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data();
  if (!userData) return false;

  const { setUsername } = useUserStore.getState();
  const { loadInitialData } = usePortfolioStore.getState();
  const { setNotifications } = useNotificationStore.getState();
  const { loadGoals } = useGoalStore.getState();
  const { loadAutoInvestments } = useAutoInvestStore.getState();
  const { setTheme } = useThemeStore.getState();
  const { loadPrivacySettings } = usePrivacyStore.getState();

  const createdAt = (userData.createdAt as Timestamp)?.toDate() || new Date();
  const theme = userData.theme || "light";

  setTheme(theme);
  setUsername(userData.username || user.displayName || "Investor");
  loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
  setNotifications(userData.notifications || []);
  loadGoals(userData.goals || []);
  loadAutoInvestments(userData.autoInvestments || []);
  loadPrivacySettings({
    leaderboardVisibility: userData.leaderboardVisibility || "public",
    showQuests: userData.showQuests === undefined ? true : userData.showQuests,
  });

  return true;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hideLoading } = useLoadingStore();

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
    setTheme("light");
    resetPrivacySettings();
  }, [resetUserStore, resetPortfolio, setNotifications, resetGoals, resetAutoInvest, setTheme, resetPrivacySettings]);


  useEffect(() => {
    const handleRedirectResult = async () => {
        setHydrating(true);
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                // This means a user has just signed in via redirect.
                // onAuthStateChanged will handle the user creation and data hydration.
                // We show the toast here because this hook only runs on the redirect return.
                 toast({
                    title: "Signed In Successfully",
                    description: "Welcome back!",
                });
            }
        } catch (error: any) {
            console.error("Redirect sign-in failed:", error);
            toast({
                variant: "destructive",
                title: "Sign In Failed",
                description: error.message || "An unknown error occurred during sign-in.",
            });
        }
        // This is set to false here, but onAuthStateChanged will continue
        // and might set it to true again briefly, which is fine.
        setHydrating(false);
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setHydrating(true);
      setIsTokenReady(false);

      if (firebaseUser) {
        setUser(firebaseUser);
        await initializeUserDocument(firebaseUser);
        const hydrated = await fetchAndHydrateUserData(firebaseUser);
        setIsTokenReady(hydrated);
        
        // Only redirect if hydration is successful and we're not already there
        if (hydrated && window.location.pathname !== "/dashboard") {
          router.push("/dashboard");
        }
      } else {
        setUser(null);
        resetAllStores();
      }
      
      hideLoading();
      setHydrating(false);
    });

    return () => unsubscribe();
  }, [router, toast, resetAllStores, hideLoading]);

  const signUp = async (email: string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { isNew } = await initializeUserDocument(userCredential.user, { username });
    if(isNew) {
      toast({
        title: "Account Created!",
        description: "Welcome to InvestWise!",
      });
    }
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    toast({
        title: "Signed In Successfully",
        description: "Welcome back!",
    });
  };

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
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

    if (data.username && data.username !== user.displayName) {
      updatesForFirestore.username = data.username;
      updatesForAuth.displayName = data.username;
    }

    if (Object.keys(updatesForFirestore).length > 0) {
      await updateDoc(userDocRef, updatesForFirestore);
    }
    if (Object.keys(updatesForAuth).length > 0) {
      await updateProfile(user, updatesForAuth);
      useUserStore.getState().setUsername(updatesForAuth.displayName!);
    }
  };

  const updateUserTheme = async (theme: "light" | "dark") => {
    useThemeStore.getState().setTheme(theme);
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { theme });
  };

  const updatePrivacySettings = async (settings: Partial<Omit<PrivacyState, any>>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, settings);
  };

  const sendPasswordReset = async () => {
    if (!user?.email) throw new Error("No email associated with user.");
    await sendPasswordResetEmail(auth, user.email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/auth/signin");
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
