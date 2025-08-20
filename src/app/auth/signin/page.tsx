
"use client";

import { useState } from "react";
import Image from "next/image";
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
import appleLogo from "./applio.webp";
import { useRouter } from "next/navigation";
import useLoadingStore from "@/store/loading-store";

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

export default function SignInPage() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();
  const { showLoading } = useLoadingStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
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

  const handleNavigateToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    router.push('/auth/signup');
  };

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
              <Button variant="outline" onClick={signInWithGoogle}>
                  <GoogleIcon /> Google
              </Button>
              <Button variant="outline" onClick={signInWithApple}>
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
                  disabled={isEmailLoading}
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
                    disabled={isEmailLoading}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(prev => !prev)}
                    disabled={isEmailLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isEmailLoading}>
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
