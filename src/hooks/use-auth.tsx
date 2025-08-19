
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
  signInWithPopup,
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

const fetchAndHydrateUserData = async (uid: string) => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    console.error("User document not found for hydration!");
    return false;
  }
  const userData = userDoc.data();

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
  setUsername(userData.username || "Investor");
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


const initializeUserDocument = async (user: User, additionalData: { username?: string } = {}) => {
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { isNew: false };
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
    photoURL: user.photoURL || "",
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
    await updateProfile(auth.currentUser, { displayName, photoURL: user.photoURL });
  }

  return { isNew: true };
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
    setTheme("light");
    resetPrivacySettings();
  }, [resetUserStore, resetPortfolio, setNotifications, resetGoals, resetAutoInvest, setTheme, resetPrivacySettings]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setHydrating(true);
      if (firebaseUser) {
          setUser(firebaseUser);
          const { isNew } = await initializeUserDocument(firebaseUser);
          await fetchAndHydrateUserData(firebaseUser.uid);
          setIsTokenReady(true);
          // This logic will run for existing users on page load/refresh
          if (!isNew && window.location.pathname.startsWith('/onboarding')) {
             router.push('/dashboard');
          }
      } else {
        setUser(null);
        resetAllStores();
        setIsTokenReady(false);
        if (
          !window.location.pathname.startsWith('/auth')
        ) {
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
      await initializeUserDocument(userCredential.user, { username });
      toast({ title: "Account Created!", description: "Let's get you started." });
      router.push("/onboarding/quiz");
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
      router.push("/dashboard");
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
            toast({ title: "Account Created!", description: "Let's get you started." });
            router.push('/onboarding/quiz');
        } else {
            toast({ title: "Signed In Successfully", description: "Welcome back!" });
            router.push("/dashboard");
        }
    } catch (error: any) {
        console.error("Popup sign-in failed:", error);
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: error.code === 'auth/popup-closed-by-user' 
              ? "The sign-in window was closed. Please try again."
              : error.message || "An unknown error occurred.",
        });
        hideLoading();
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
