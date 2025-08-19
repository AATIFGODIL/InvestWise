
import { auth as adminAuth } from "firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase/admin";
import AppLayout from "@/components/layout/app-layout";
import ProfileClient from "@/components/profile/profile-client";

async function getUserData(uid: string) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    const data = userDoc.data();
    return {
      username: data?.username || "Investor",
      email: data?.email || "",
      uid: data?.uid || uid,
    };
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    redirect("/auth/signin");
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
     console.error("Error verifying session cookie:", error);
     redirect("/auth/signin");
  }
  
  const userData = await getUserData(decodedToken.uid);

  if (!userData) {
    // This could happen if the user exists in Auth but not in Firestore.
    // Redirecting to sign-in might be a safe fallback.
    redirect("/auth/signin");
  }
  
  return (
    <AppLayout>
      <ProfileClient initialUserData={userData} />
    </AppLayout>
  );
}
