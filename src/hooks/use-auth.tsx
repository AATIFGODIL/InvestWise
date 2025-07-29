
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
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/user-store";
import usePortfolioStore from "@/store/portfolio-store";
import useNotificationStore, { type Notification } from "@/store/notification-store";
import useGoalStore from "@/store/goal-store";
import useAutoInvestStore from "@/store/auto-invest-store";
import useThemeStore from "@/store/theme-store";
import { storage } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  hydrating: boolean;
  signUp: (email:string, pass: string, username: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, photoDataUrl?: string }) => Promise<void>;
  updateUserTheme: (theme: "light" | "dark") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initializeUserDocument = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const displayName = user.displayName || "Investor";
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
    if (auth.currentUser && auth.currentUser.displayName !== displayName) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
    }
    
    // Return the initial data for setting stores
    return {
      username: displayName,
      photoURL: photoURL,
      notifications: [welcomeNotification],
      theme: 'light',
      portfolio: newUserDoc.portfolio,
      goals: newUserDoc.goals,
      autoInvestments: newUserDoc.autoInvestments,
    };
};

const fetchUserData = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          return userDoc.data();
      } else {
          return await initializeUserDocument(user);
      }
  } catch (error) {
      console.error("Error fetching user data, initializing document as fallback:", error);
      return await initializeUserDocument(user);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  const { setUsername, setProfilePic } = useUserStore();
  const { loadInitialData, resetPortfolio } = usePortfolioStore();
  const { setNotifications } = useNotificationStore();
  const { loadGoals, resetGoals } = useGoalStore();
  const { loadAutoInvestments, resetAutoInvest } = useAutoInvestStore();
  const { setTheme } = useThemeStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setHydrating(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userData = await fetchUserData(firebaseUser);
        
        await Promise.all([
            Promise.resolve(setUsername(userData.username || firebaseUser.displayName || "Investor")),
            Promise.resolve(setProfilePic(userData.photoURL || "")),
            Promise.resolve(loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null)),
            Promise.resolve(setNotifications(userData.notifications || [])),
            Promise.resolve(loadGoals(userData.goals || [])),
            Promise.resolve(loadAutoInvestments(userData.autoInvestments || [])),
            Promise.resolve(setTheme(userData.theme || 'light')),
        ]);

      } else {
        setUser(null);
        resetAllStores();
      }
      setHydrating(false);
    });

    return () => unsubscribe();
  }, [resetAllStores, setUsername, setProfilePic, loadInitialData, setNotifications, loadGoals, loadAutoInvestments, setTheme]);


  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: username, photoURL: "" });
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

    if (user && Object.keys(profileUpdate).length > 0) {
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
    setTheme(theme);
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/auth/signin');
  };

  const value = {
    user,
    hydrating,
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
