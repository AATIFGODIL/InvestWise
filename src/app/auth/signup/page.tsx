
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import appleLogo from "../signin/applio.webp";


const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-2">
        <path fill="#4285F4" d="M24 9.8c3.2 0 6.1 1.1 8.4 3.2l6.3-6.3C34.9 2.8 29.9 1 24 1 14.3 1 6.1 6.6 2.7 14.8l7.7 6C12.1 14.2 17.6 9.8 24 9.8z"></path><path fill="#34A853" d="M24 47c5.9 0 11-1.9 14.9-5.2l-7.2-5.6c-2.1 1.4-4.8 2.2-7.7 2.2-6.4 0-11.9-4.4-13.8-10.3l-7.7 6C6.1 40.4 14.3 47 24 47z"></path><path fill="#FBBC05" d="M10.2 28.9c-.6-1.8-.9-3.7-.9-5.6s.3-3.8.9-5.6l-7.7-6C1 14.7 0 19.2 0 24s1 9.3 2.5 12.6l7.7-6z"></path><path fill="#EA4335" d="M24 18.7c-3.1 0-5.7 1-7.7 2.8l-7.2-5.6C13 10.7 18.1 7 24 7c9.7 0 17.9 5.6 21.3 13.8l-7.7 6c-1.7-5.9-7.2-10.3-13.6-10.3z"></path><path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const AppleIcon = () => (
    <Image
      src={appleLogo}
      alt="Apple"
      width={20}
      height={20}
      className="mr-2 rounded-sm"
    />
);

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, username);
      // Redirect is now handled by onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join InvestWise to start your investment journey today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign Up Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={signInWithGoogle} disabled={loading}>
                <GoogleIcon /> Google
            </Button>
            <Button variant="outline" onClick={signInWithApple} disabled={loading}>
                <AppleIcon /> Apple
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                />
                 <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="pr-10"
                  disabled={loading}
                />
                 <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="#" className="underline">
                  Terms and Conditions
                </Link>
                .
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account?&nbsp;
          <Link href="/auth/signin" className="underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

    