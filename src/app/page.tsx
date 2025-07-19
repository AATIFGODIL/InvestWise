
import { redirect } from "next/navigation";

// Redirect to the sign-in page by default.
export default function Home() {
  redirect('/auth/signin');
}
