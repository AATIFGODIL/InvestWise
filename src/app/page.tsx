
import { redirect } from "next/navigation";

// Redirect to the sign-in page by default.
// The onboarding flow will take the user to the dashboard.
export default function Home() {
  redirect('/auth/signin');
}
