
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLoadingStore from '@/store/loading-store';
import { useToast } from '@/hooks/use-toast';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AnimatedBorder from '@/components/auth/animated-border';

// A simple SVG component for the Google icon.
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5 mr-2">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 121.3 109.8 8.4 244 8.4c69.1 0 128.8 28.2 172.4 72.3l-66.5 64.2c-28.1-26.8-63.5-42.6-105.9-42.6-83.3 0-151.5 68.2-151.5 151.9s68.2 151.9 151.5 151.9c97.9 0 134.9-65.5 139.7-99.9H244V243.6h244v18.2z" />
  </svg>
);

// A decorative background component with subtle financial-themed patterns.
const FinanceBackground = () => (
  <div className="absolute inset-0">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="finance-pattern"
          width="140"
          height="140"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          {/* Decorative icons drawn with SVG paths */}
          <path d="M 20 120 V 90 M 30 120 V 80 M 40 120 V 100" stroke="hsl(var(--primary) / 0.12)" strokeWidth="2" fill="none" className="shimmering-icon" style={{ animationDelay: '0.5s' }} />
          <path d="M 70 20 A 15 15 0 0 1 85 35 L 70 35 Z" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="hsl(var(--primary) / 0.05)" className="shimmering-icon" style={{ animationDelay: '1s' }} />
          <circle cx="70" cy="35" r="15" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '1.5s' }} />
          <path d="M 110 80 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 120 100 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 110 98 L 122 82" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '2s' }}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="hsl(var(--background))" />
      <rect width="100%" height="100%" fill="url(#finance-pattern)" />
    </svg>
  </div>
);


export default function SignInPage() {
  const { signIn, signInWithGoogle, sendPasswordReset } = useAuth();
  const router = useRouter();
  const { showLoading } = useLoadingStore();
  const { toast } = useToast();
  const { isClearMode, theme } = useThemeStore();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isLightClear = isClearMode && theme === 'light';

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailLoading(true);
    try {
      await signIn(email, password);
      // Redirect is handled by the useAuth hook's onAuthStateChanged listener.
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
      // Redirect is also handled by the useAuth hook.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError(null);
    try {
      await sendPasswordReset(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // This function shows a loading overlay for a smoother perceived transition between pages.
  const handleNavigateToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    router.push('/auth/signup');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <FinanceBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onAnimationComplete={() => setIsAnimationComplete(true)}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: "1000px" }}
      >
        <Card
          className={cn(
              "w-full relative",
              isClearMode 
                  ? isLightClear
                      ? "bg-card/60 ring-1 ring-white/10"
                      : "bg-white/10 ring-1 ring-white/60"
                  : ""
          )}
          // COPY-THIS: For the glass look (backdrop filter)
          style={{ backdropFilter: isClearMode ? "blur(16px)" : "none" }}
        >
            {isAnimationComplete && <AnimatedBorder />}
            <div className="flex justify-center items-center pt-8 gap-2">
                <h1 className="text-3xl font-bold text-primary">InvestWise</h1>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>
                Sign in to continue your investment journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sign-In Failed</AlertTitle>
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
                        <GoogleIcon /> Continue with Google
                      </>
                    )}
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className={cn("px-2 text-muted-foreground", isClearMode && !isLightClear ? "bg-card" : "bg-background")}>Or continue with</span>
                </div>
              </div>
              <form onSubmit={handleEmailSignIn} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEmailLoading || isGoogleLoading}
                  />
                </div>
                <div className="grid gap-2">
                   <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="text-sm underline"
                      >
                          Forgot password?
                      </button>
                   </div>
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
                      Signing In...
                    </>
                  ) : (
                    'Sign In with Email'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-sm">
              Don&apos;t have an account?&nbsp;
              <Link href="/auth/signup" className="underline" onClick={handleNavigateToSignUp}>
                Sign Up
              </Link>
            </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
