
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
            >
            <path
                d="M 25 0 V 10 M 20 5 H 30 M 50 15 V 25 M 45 20 H 55 M 75 30 V 40 M 70 35 H 80 M 10 50 L 20 60 L 30 50 L 40 60 M 60 70 L 70 80 L 80 70 L 90 80 M 5 80 H 15 M 10 75 V 85"
                strokeWidth="0.5"
                className="stroke-muted-foreground/10"
                fill="none"
            />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#finance-pattern)" />
        </svg>
  </div>
);


export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { showLoading } = useLoadingStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailLoading(true);
    try {
      await signIn(email, password);
      // Redirect is handled by onAuthStateChanged in useAuth hook
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect is handled by the hook
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleNavigateToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    router.push('/auth/signup');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
      <FinanceBackground />
      <Card className="w-full max-w-sm">
          <div className="flex justify-center pt-8">
              <h1 className="text-3xl font-bold text-primary">InvestWise</h1>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Choose your preferred sign in method.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign In Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full" disabled={isEmailLoading || isGoogleLoading}>
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <GoogleIcon /> Google
                    </>
                  )}
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
            <form onSubmit={handleEmailSignIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailLoading || isGoogleLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    disabled={isEmailLoading || isGoogleLoading}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={isEmailLoading || isGoogleLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isEmailLoading || isGoogleLoading}>
                {isEmailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in with Email'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Don&apos;t have an account?&nbsp;
            <Link href="/auth/signup" className="underline" onClick={handleNavigateToSignUp}>
              Sign up
            </Link>
          </CardFooter>
      </Card>
    </div>
  );
}
