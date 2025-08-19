
import { auth as adminAuth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import ProfileClient from "@/components/profile/profile-client";
import type { UserRecord } from "firebase-admin/auth";

// This is a Server Component, responsible for fetching data securely.
async function getUserData(uid: string, user: UserRecord) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      // This is a fallback in case the Firestore doc wasn't created on sign-up.
      return {
        username: user.displayName || "Investor",
        email: user.email || "",
        uid: uid,
        photoURL: user.photoURL || "",
      };
    }
    const data = userDoc.data();
    return {
      username: data?.username || user.displayName || "Investor",
      email: data?.email || user.email || "",
      uid: uid,
      photoURL: data?.photoURL || user.photoURL || "",
    };
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    // Return auth data as a fallback if Firestore fails
    return {
      username: user.displayName || "Investor",
      email: user.email || "",
      uid: uid,
      photoURL: user.photoURL || "",
    };
  }
}

export default async function ProfilePage() {
  const sessionCookie = cookies().get("session")?.value;

  if (!sessionCookie) {
    // If no cookie, redirect to sign-in. This is expected.
    redirect("/auth/signin");
  }

  let decodedToken;
  try {
    // Verify the session cookie. If this throws, the cookie is invalid.
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
     console.error("Error verifying session cookie:", error);
     // Invalid cookie, redirect to sign-in.
     redirect("/auth/signin");
  }

  // Get the full user record from Firebase Auth
  const user = await adminAuth.getUser(decodedToken.uid);
  
  // Fetch user data from Firestore using the verified UID
  const userData = await getUserData(decodedToken.uid, user);

  if (!userData) {
    // This case should be rare, but as a fallback, redirect.
    redirect("/auth/signin");
  }
  
  return (
    <AppLayout>
      <ProfileClient initialUserData={userData} />
    </AppLayout>
  );
}
