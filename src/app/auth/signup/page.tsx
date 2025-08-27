
"use client";

import { useState } from "react";
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
import useLoadingStore from "@/store/loading-store";


const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5 mr-2">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 121.3 109.8 8.4 244 8.4c69.1 0 128.8 28.2 172.4 72.3l-66.5 64.2c-28.1-26.8-63.5-42.6-105.9-42.6-83.3 0-151.5 68.2-151.5 151.9s68.2 151.9 151.5 151.9c97.9 0 134.9-65.5 139.7-99.9H244V243.6h244v18.2z" />
  </svg>
);

const FinanceBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
        className="absolute left-0 top-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
            <pattern
            id="finance-pattern"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
            >
            <path
                d="M 30 0 V 12 M 24 6 H 36 M 60 18 V 30 M 54 24 H 66 M 90 36 V 48 M 84 42 H 96 M 12 60 L 24 72 L 36 60 L 48 72 M 72 84 L 84 96 L 96 84 L 108 96 M 6 96 H 18 M 12 90 V 102"
                strokeWidth="1"
                stroke="hsl(var(--primary) / 0.1)"
                fill="none"
            />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#finance-pattern)" />
        </svg>
  </div>
);


export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const { showLoading } = useLoadingStore();
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

  const handleNavigateToSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    router.push('/auth/signin');
  };


  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
      <FinanceBackground />
      <Card className="w-full max-w-sm">
        <div className="flex justify-center pt-8">
            <h1 className="text-3xl font-bold text-primary">InvestWise</h1>
        </div>
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
          <div className="grid gap-2">
            <Button variant="outline" onClick={signInWithGoogle} disabled={loading} className="w-full">
                <GoogleIcon /> Google
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
          <Link href="/auth/signin" className="underline" onClick={handleNavigateToSignIn}>
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
