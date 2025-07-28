
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email:string, pass: string, username: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: { username?: string, photoDataUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUsername, setProfilePic } = useUserStore();
  const { loadInitialData, resetPortfolio } = usePortfolioStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUsername(userData.username || user.displayName || "Investor");
      setProfilePic(userData.photoURL || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`);
      loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null);
    } else {
        // This case handles a new user signing in for the first time.
        await initializeUserDocument(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        await fetchUserData(user);
      } else {
        setUser(null);
        resetPortfolio();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeUserDocument = async (user: User, username?: string | null) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const initialPortfolio = {
          holdings: [],
          summary: {
              totalValue: 0,
              todaysChange: 0,
              totalGainLoss: 0,
              annualRatePercent: 0,
          }
      };

      const displayName = username || user.displayName || "Investor";
      const photoURL = user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`;
      
      const newUserDoc = {
        uid: user.uid,
        email: user.email,
        username: displayName,
        photoURL: photoURL,
        createdAt: new Date(),
        portfolio: initialPortfolio
      };

      await setDoc(userDocRef, newUserDoc);

      if (!user.displayName || !user.photoURL) {
          await updateProfile(user, { displayName, photoURL });
      }
      
      // Manually update local state for new users to prevent race conditions
      setUsername(displayName);
      setProfilePic(photoURL);
      loadInitialData(initialPortfolio.holdings, initialPortfolio.summary);
    }
  };


  const signUp = async (email:string, pass: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    await initializeUserDocument(newUser, username || "First-Time Investor");
    setUser(newUser);
  }

  const signIn = (email:string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const handleSocialSignIn = async (provider: FirebaseAuthProvider) => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await initializeUserDocument(user);
    setUser(user);
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
    let photoURL = user.photoURL;

    if (data.photoDataUrl) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadString(storageRef, data.photoDataUrl, 'data_url');
        photoURL = await getDownloadURL(storageRef);
        setProfilePic(photoURL as string);
    }
    
    const updateData: { [key: string]: any } = {
        ...(data.username && { username: data.username }),
        ...(photoURL && { photoURL: photoURL }),
    };

    await updateDoc(userDocRef, updateData);
    await updateProfile(user, {
        ...(data.username && { displayName: data.username }),
        ...(photoURL && { photoURL: photoURL }),
    });

    if (data.username) {
        setUsername(data.username);
    }
  };


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
