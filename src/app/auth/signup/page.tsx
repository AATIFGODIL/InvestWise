
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.854 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.11 2.4-4.333 0-7.813-3.373-7.813-7.56s3.48-7.56 7.813-7.56c2.333 0 4.027 1.013 4.987 2.013l2.213-2.213C18.2 1.013 15.787 0 12.48 0 5.867 0 0 5.867 0 12.48s5.867 12.48 12.48 12.48c6.933 0 11.8-4.773 11.8-11.8 0-.933-.093-1.667-.2-2.52H12.48z" fill="currentColor"/>
    </svg>
);

const AppleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2">
        <title>Apple</title>
        <path d="M12.152 6.896c-.922 0-1.758.461-2.435 1.176-.749.784-1.241 1.86-1.241 3.015 0 .093.008.185.023.276.016.09.023.16.023.183.016.14.055.33.109.574.158.723.496 1.453.98 1.95.485.498 1.03.784 1.637.784.14 0 .28-.015.42-.046.14-.031.295-.093.468-.185a5.558 5.558 0 0 0 .56-.356c.158-.124.3-.255.42-.387.12-.132.224-.263.308-.387.085-.124.124-.185.124-.185s.047-.085.109-.232c.062-.148.093-.264.093-.34 0-.062-.016-.132-.047-.209-.03-.077-.078-.16-.14-.255-.061-.093-.155-.224-.28-.418-.248-.363-.56-1.003-.56-1.898.008-.832.324-1.508.832-1.95.232-.202.5-.364.809-.488.309-.124.634-.185.965-.185.124 0 .255.016.394.047.14.03.263.062.37.092.109.032.193.055.255.07.062.016.093.023.093.023.016 0 .016-.023 0-.055-.008-.03-.008-.061-.008-.092 0-.256-.039-.51-.117-.76-.077-.25-.21-.5-.401-.741-.19-.241-.435-.46-.73-.648-.293-.186-.63-.332-1.003-.435-.373-.108-.784-.163-1.23-.163M9.839 21.085c.677.108.987.432 1.35.986.364.553.64 1.25.795 2.052.155.8.217 1.6.14 2.37-.93 0-1.8-.201-2.61-.592C8.7 25.51 8.16 25.02 7.74 24.32c-.42-.7-.657-1.453-.657-2.22 0-.825.263-1.635.79-2.428.528-.793 1.25-1.39 2.156-1.78zm4.39-2.298C12.785 17.61 11.23 17.2 9.61 16.29c-1.62-.9-2.8-2.31-3.44-4.14-.64-1.83-.6-3.76.08-5.63.68-1.87 1.9-3.48 3.53-4.63 1.63-1.15 3.58-1.78 5.61-1.78.36 0 .72.03 1.07.1.35.07.7.18 1.04.33.25.1.48.24.7.41.22.17.43.36.62.58.19.22.36.46.51.72.15.26.28.54.38.83s.18.59.22.9c.04.31.02.63-.08.93a.93.93 0 0 1-.54.66c-.28.1-.6.04-.82-.2-.05-.05-.1-.1-.15-.16a5.75 5.75 0 0 0-2.07-2.3c-1.3-.8-2.8-1-4.25-.62-.3.08-.58.2-.84.35-.26.15-.5.33-.7.54-.2.21-.37.44-.5.69s-.22.5-.27.76c-.05.26-.04.53.04.79.08.26.2.5.37.72.17.22.37.4.6.56.23.16.48.28.74.37.26.09.53.13.8.13.38 0 .75-.08 1.1-.24.35-.16.68-.37.97-.64.3-.27.54-.57.74-.9.05-.08.1-.15.15-.22.2-.28.5-.38.8-.28.3.1.48.4.4.74 0 .1-.02.2-.07.28-.05.08-.1.15-.17.22-.17.18-.36.34-.56.48-.2.14-.42.26-.65.36-.23.1-.47.18-.72.24a3.8 3.8 0 0 1-1.7.02z" fill="currentColor"/>
    </svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
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
        toast({
            variant: "destructive",
            title: "Passwords do not match!",
            description: "Please re-enter your passwords.",
        });
        return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password);
      toast({
          title: "Success!",
          description: "Your account has been created.",
        });
      router.push("/onboarding/quiz");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithApple;
      await signInMethod();
      toast({
        title: "Signed In Successfully",
        description: `Welcome!`,
      });
      router.push("/dashboard");
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
            <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={loading}>
                <GoogleIcon /> Google
            </Button>
            <Button variant="outline" onClick={() => handleSocialSignIn('apple')} disabled={loading}>
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
              {loading ? 'Creating Account...' : 'Create account'}
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
