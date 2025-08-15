
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
import useLoadingStore from "@/store/loading-store";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-2">
        <title>Google</title>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const AppleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current">
        <title>Apple</title>
        <path d="M12.035 17.633c-.953 0-1.832.324-2.618.97-1.121.908-1.855 2.1-1.832 3.424.01.07.034.132.05.192.015.06.04.12.064.18.06.152.128.304.22.448.092.144.184.272.292.392.852.92 1.932 1.48 3.032 1.48.14 0 .28-.008.42-.024.132-.016.26-.04.384-.072.12-.03.24-.07.352-.112.112-.044.22-.084.328-.132 1.032-.448 1.848-1.24 2.448-2.316-.784-.5-1.588-.744-2.4-1.024-1.2-.424-2.18-.884-2.88-1.58C12.16 17.65 12.1 17.633 12.035 17.633zm3.812-3.3c.536-1.04.84-2.204.852-3.392C16.7 8.933 15.204 7.2 13.06 6.817c-1.224-.224-2.4.056-3.36.752-.84.616-1.44 1.524-1.784 2.584-.52 1.624.184 3.424 1.22 4.624.96.96 2.14 1.448 3.328 1.448.24 0 .48-.032.712-.096.24-.064.472-.128.704-.224.224-.088.448-.192.664-.312.216-.12.424-.24.632-.376.104-.064.2-.12.312-.192l.024-.012c.096-.064.192-.12.288-.192.088-.064.176-.128.256-.2.088-.08.16-.144.232-.216a.72.72 0 00.12-.108zM12.94 0c-1.584 0-3.12.784-4.024 2.064-1.432 2.112-.868 4.88.948 6.136.8.52 1.744.784 2.68.784.84 0 1.68-.24 2.472-.736C16.6 7.4 17.5 5.3 17.028 3.12 16.292 1.15 14.74 0 12.94 0z"/>
    </svg>
);

export default function SignInPage() {
  const { signIn, signInWithGoogle, signInWithApple, hydrating } = useAuth();
  const { showLoading } = useLoadingStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    showLoading();
    try {
      await signIn(email, password);
      // Redirect is handled by onAuthStateChanged in useAuth hook
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setError(null);
    showLoading();
    try {
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithApple;
      await signInMethod();
      // The redirect will happen now. The rest of the flow is in useAuth.
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (hydrating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finalizing your sign-in...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
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
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => handleSocialSignIn('google')}>
                  <GoogleIcon /> Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialSignIn('apple')}>
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
              <Button type="submit" className="w-full">
                Sign in with Email
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Don&apos;t have an account?&nbsp;
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </CardFooter>
      </Card>
    </div>
  );
}
