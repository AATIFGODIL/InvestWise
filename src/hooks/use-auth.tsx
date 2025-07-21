
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
  signUp: (email:string, pass: string) => Promise<any>;
  signIn: (email:string, pass: string) => Promise<any>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "Investor");
          setProfilePic(userData.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`);
          
          if (!user.displayName || !user.photoURL) {
             await updateProfile(user, { 
                displayName: userData.username,
                photoURL: userData.photoURL
            });
          }
          // Load user-specific portfolio data
          loadInitialData(userData.portfolio?.holdings || [], userData.portfolio?.summary || null);

        } else {
            // This is a new user who just signed up, create their doc
             await initializeUserDocument(user, "First-Time Investor");
        }
        setUser(user);
      } else {
        setUser(null);
        resetPortfolio(); // Reset to default state when logged out
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUsername, setProfilePic, loadInitialData, resetPortfolio]);

  const initializeUserDocument = async (user: User, username: string) => {
    const initialPortfolio = {
        holdings: [],
        summary: {
            totalValue: 0,
            todaysChange: 0,
            totalGainLoss: 0,
            annualRatePercent: 0,
        }
    };

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      createdAt: new Date(),
      portfolio: initialPortfolio
    });
    
    await updateProfile(user, { displayName: username, photoURL: user.photoURL });
    setUsername(username);
    setProfilePic(user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`);
    loadInitialData(initialPortfolio.holdings, initialPortfolio.summary);
  };


  const signUp = async (email:string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await initializeUserDocument(user, "First-Time Investor");
    return userCredential;
  }

  const signIn = (email:string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }
  
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
