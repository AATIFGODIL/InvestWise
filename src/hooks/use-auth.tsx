
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
  updateUserProfile: (data: { username?: string, photoDataUrl?: string | null }) => Promise<void>;
  updateUserTheme: (theme: "light" | "dark") => Promise<void>;
  sendPasswordReset: () => Promise<void>;
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
    if (auth.currentUser && (auth.currentUser.displayName !== displayName || auth.currentUser.photoURL !== photoURL)) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
    }
    
    return newUserDoc;
};

const fetchUserData = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          return userDoc.data();
      } else {
          console.log("User document not found, initializing new one.");
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
      setUser(firebaseUser);
      setHydrating(false);

      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUsername(userData.username || firebaseUser.displayName || "Investor");
        setProfilePic(userData.photoURL || "");
        loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null);
        setNotifications(userData.notifications || []);
        loadGoals(userData.goals || []);
        loadAutoInvestments(userData.autoInvestments || []);
        setTheme(userData.theme || 'light');
      } else {
        resetAllStores();
      }
    });

    return () => unsubscribe();
  }, [resetAllStores, setUsername, setProfilePic, loadInitialData, setNotifications, loadGoals, loadAutoInvestments, setTheme]);


  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: username, photoURL: "" });
    await initializeUserDocument(newUser);
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
  
  const updateUserProfile = async (data: { username?: string, photoDataUrl?: string | null }) => {
    if (!user) throw new Error("User not authenticated");

    const userDocRef = doc(db, "users", user.uid);
    let photoURL = useUserStore.getState().profilePic; // Start with current pic
    let hasPhotoChanged = false;

    // Check if a new photo data URL was provided and it's different from the current one
    if (data.photoDataUrl && data.photoDataUrl.startsWith('data:image')) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadString(storageRef, data.photoDataUrl, 'data_url');
        photoURL = await getDownloadURL(storageRef);
        hasPhotoChanged = true;
    }
    
    const firestoreUpdateData: { [key: string]: any } = {};
    const authUpdateData: { displayName?: string; photoURL?: string } = {};

    if (data.username && data.username !== useUserStore.getState().username) {
        firestoreUpdateData.username = data.username;
        authUpdateData.displayName = data.username;
    }
    if (hasPhotoChanged) {
        firestoreUpdateData.photoURL = photoURL;
        authUpdateData.photoURL = photoURL;
    }

    if (Object.keys(firestoreUpdateData).length > 0) {
        await updateDoc(userDocRef, firestoreUpdateData);
    }
    
    if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(user, authUpdateData);
    }

    // Update global state from the source of truth
    if (authUpdateData.displayName) {
        setUsername(authUpdateData.displayName);
    }
    if (authUpdateData.photoURL) {
        setProfilePic(authUpdateData.photoURL);
    }
  };

  const updateUserTheme = async (theme: "light" | "dark") => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { theme });
    setTheme(theme);
  }

  const sendPasswordReset = async () => {
    if (!user?.email) throw new Error("No email associated with user.");
    await sendPasswordResetEmail(auth, user.email);
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
