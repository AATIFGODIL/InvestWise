
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore, { type Notification } from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";
import usePrivacyStore, { type PrivacyState } from "@/store/privacy-store";
import { storage } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  hydrating: boolean;
  isTokenReady: boolean;
  signUp: (email:string, pass: string, username: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, imageFile?: File | null }) => Promise<void>;
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
        const updates: any = {};
        if (additionalData.username && additionalData.username !== existingData.username) {
            updates.username = additionalData.username;
        }
        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);
        }
        return { ...existingData, ...updates };
    }

    const displayName = additionalData.username || user.displayName || "Investor";
    const photoURL = user.photoURL || "";
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
        photoURL: photoURL,
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
    
    if (auth.currentUser && (auth.currentUser.displayName !== displayName || auth.currentUser.photoURL !== photoURL)) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
    }
    
    return newUserDoc;
};


const fetchAndHydrateUserData = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    let userDoc = await getDoc(userDocRef);

    // This handles a race condition where a user is created but their doc isn't ready.
    if (!userDoc.exists()) {
        await initializeUserDocument(user);
        userDoc = await getDoc(userDocRef);
    }

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const { setUsername, setProfilePic } = useUserStore.getState();
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
        setProfilePic(userData.photoURL || "");
        loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null, createdAt);
        setNotifications(userData.notifications || []);
        loadGoals(userData.goals || []);
        loadAutoInvestments(userData.autoInvestments || []);
        loadPrivacySettings({
            leaderboardVisibility: userData.leaderboardVisibility || 'public',
            showQuests: userData.showQuests === undefined ? true : userData.showQuests,
        });
        return true;
    }
    return false;
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
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
    setTheme('light'); // Reset theme to default
    resetPrivacySettings();
  }, [resetUserStore, resetPortfolio, setNotifications, resetGoals, resetAutoInvest, setTheme, resetPrivacySettings]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setHydrating(true);
      setIsTokenReady(false);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchAndHydrateUserData(firebaseUser);
        // All data is hydrated, now we can finish loading and confirm token readiness
        setIsTokenReady(true);
        setHydrating(false);
      } else {
        setUser(null);
        resetAllStores();
        // No user, so no token is ready, and we're done "hydrating" to the logged-out state.
        setIsTokenReady(false);
        setHydrating(false);
      }
    });

    return () => unsubscribe();
  }, [resetAllStores]);


  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: username, photoURL: "" });
    await initializeUserDocument(newUser, { username });
  }

  const signIn = async (email:string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
    await signInWithPopup(auth, provider);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleSocialSignIn(provider);
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    await handleSocialSignIn(provider);
  };
  
  const updateUserProfile = async (data: { username?: string, imageFile?: File | null }) => {
    if (!user) throw new Error("User not authenticated.");

    const userDocRef = doc(db, "users", user.uid);
    const updatesForFirestore: { [key: string]: any } = {};
    const updatesForAuth: { displayName?: string, photoURL?: string } = {};
    const { setUsername, setProfilePic } = useUserStore.getState();

    let photoURL = user.photoURL;

    // Handle image upload first
    if (data.imageFile) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, data.imageFile);
        photoURL = await getDownloadURL(storageRef);
        updatesForFirestore.photoURL = photoURL;
        updatesForAuth.photoURL = photoURL;
    }
    
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
    if (updatesForAuth.photoURL) {
        setProfilePic(updatesForAuth.photoURL);
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
    await firebaseSignOut(auth);
    resetAllStores();
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
