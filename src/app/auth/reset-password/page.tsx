
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionCode, setActionCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      verifyPasswordResetCode(code)
        .then(() => {
          setActionCode(code);
          setLoading(false);
        })
        .catch((err) => {
          setError("The password reset link is invalid or has expired. Please request a new one.");
          setLoading(false);
        });
    } else {
      setError("No password reset code provided. Please check the link or request a new one.");
      setLoading(false);
    }
  }, [searchParams, verifyPasswordResetCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!actionCode) {
      setError("Invalid action code. Cannot reset password.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(actionCode, newPassword);
      setSuccess("Your password has been successfully reset! You will be redirected to sign in shortly.");
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying reset link...</p>
      </div>
    );
  }

  if (success) {
     return (
        <Alert variant="default" className="border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
        </Alert>
     )
  }

  return (
    <form onSubmit={handleResetPassword} className="grid gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
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
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
      <div className="text-center text-sm">
        Remembered your password?{' '}
        <Link href="/auth/signin" className="underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}


export default function ResetPasswordPage() {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
            <FinanceBackground />
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
                style={{ perspective: "1000px" }}
            >
                <Card
                    className={cn(
                        "w-full",
                        isClearMode 
                            ? isLightClear
                                ? "bg-card/60 ring-1 ring-white/10"
                                : "bg-white/10 ring-1 ring-white/60"
                            : ""
                    )}
                    style={{ backdropFilter: isClearMode ? "blur(16px)" : "none" }}
                >
                    <div className="flex justify-center items-center pt-8 gap-2">
                        <h1 className="text-3xl font-bold text-primary">InvestWise</h1>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                        <CardDescription>
                        Enter a new password for your account below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
