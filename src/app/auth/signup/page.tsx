
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5 mr-2">
    <path d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 121.3 109.8 8.4 244 8.4c69.1 0 128.8 28.2 172.4 72.3l-66.5 64.2c-28.1-26.8-63.5-42.6-105.9-42.6-83.3 0-151.5 68.2-151.5 151.9s68.2 151.9 151.5 151.9c97.9 0 134.9-65.5 139.7-99.9H244V243.6h244v18.2z" />
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
