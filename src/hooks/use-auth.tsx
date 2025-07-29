
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
  type AuthProvider as FirebaseAuthProvider,
  type User,
} from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore, { type Notification } from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email:string, pass: string, username: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, photoDataUrl?: string }) => Promise<void>;
  updateUserTheme: (theme: "light" | "dark") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Zustand store setters
  const { setUsername, setProfilePic } = useUserStore();
  const { loadInitialData, resetPortfolio } = usePortfolioStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const { loadGoals, resetGoals } = useGoalStore();
  const { loadAutoInvestments, resetAutoInvest } = useAutoInvestStore();
  const { setTheme } = useThemeStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeUserDocument = useCallback(async (user: User, username?: string | null) => {
    const userDocRef = doc(db, "users", user.uid);

    const displayName = username || user.displayName || "Investor";
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
      createdAt: new Date(),
      portfolio: { holdings: [], summary: { totalValue: 0, todaysChange: 0, totalGainLoss: 0, annualRatePercent: 0 } },
      notifications: [welcomeNotification],
      goals: [],
      autoInvestments: [],
    };

    await setDoc(userDocRef, newUserDoc);
    
    if (user.displayName !== displayName || user.photoURL !== photoURL) {
      await updateProfile(user, { displayName, photoURL });
    }
    
    // Set initial state in stores
    setUsername(displayName);
    setProfilePic(photoURL);
    loadInitialData([], null);
    setNotifications([welcomeNotification]);
    loadGoals([]);
    loadAutoInvestments([]);
    setTheme('light');
  }, [setUsername, setProfilePic, loadInitialData, setNotifications, addNotification, loadGoals, loadAutoInvestments, setTheme]);

  const fetchUserData = useCallback(async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUsername(userData.username || user.displayName || "Investor");
      setProfilePic(userData.photoURL || "");
      loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null);
      setNotifications(userData.notifications || []);
      loadGoals(userData.goals || []);
      loadAutoInvestments(userData.autoInvestments || []);
      setTheme(userData.theme || 'light');
      return true;
    }
    return false;
  }, [setUsername, setProfilePic, loadInitialData, setNotifications, loadGoals, loadAutoInvestments, setTheme]);
  
  const resetAllStores = useCallback(() => {
    setUsername("Investor");
    setProfilePic("");
    setNotifications([]);
    resetPortfolio();
    resetGoals();
    resetAutoInvest();
    setTheme('light');
  }, [setUsername, setProfilePic, setNotifications, resetPortfolio, resetGoals, resetAutoInvest, setTheme]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          setUser(user);
          const userExists = await fetchUserData(user);
          if (!userExists) {
            await initializeUserDocument(user);
          }
        } else {
          setUser(null);
          resetAllStores();
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        setUser(null);
        resetAllStores();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData, initializeUserDocument, resetAllStores]);

  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    await initializeUserDocument(newUser, username);
    setUser(newUser);
  }

  const signIn = (email:string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
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
  
  const updateUserProfile = async (data: { username?: string, photoDataUrl?: string }) => {
    if (!user) throw new Error("User not authenticated");

    const userDocRef = doc(db, "users", user.uid);
    let photoURL = user.photoURL || "";

    if (data.photoDataUrl) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadString(storageRef, data.photoDataUrl, 'data_url');
        photoURL = await getDownloadURL(storageRef);
    }
    
    const updateData: { [key: string]: any } = {};

    if (data.username) updateData.username = data.username;
    if (data.photoDataUrl) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length > 0) {
        await updateDoc(userDocRef, updateData);
    }

    const profileUpdate: { displayName?: string; photoURL?: string } = {};
    if (data.username) profileUpdate.displayName = data.username;
    if (data.photoDataUrl && photoURL) {
      profileUpdate.photoURL = photoURL;
    }

    if (Object.keys(profileUpdate).length > 0) {
        await updateProfile(user, profileUpdate);
    }

    if (data.username) {
        setUsername(data.username);
    }
    if (data.photoDataUrl) {
        setProfilePic(photoURL);
    }
  };

  const updateUserTheme = async (theme: "light" | "dark") => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { theme });
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/auth/signin');
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUserProfile,
    updateUserTheme,
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
