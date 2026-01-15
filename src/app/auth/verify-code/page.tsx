// InvestWise - Email Verification Code Page
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import useLoadingStore from '@/store/loading-store';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';
import AnimatedBorder from '@/components/auth/animated-border';
import { useToast } from '@/hooks/use-toast';

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
                    <path d="M 20 120 V 90 M 30 120 V 80 M 40 120 V 100" stroke="hsl(var(--primary) / 0.12)" strokeWidth="2" fill="none" className="shimmering-icon" style={{ animationDelay: '0.5s' }} />
                    <path d="M 70 20 A 15 15 0 0 1 85 35 L 70 35 Z" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="hsl(var(--primary) / 0.05)" className="shimmering-icon" style={{ animationDelay: '1s' }} />
                    <circle cx="70" cy="35" r="15" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '1.5s' }} />
                    <path d="M 110 80 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 120 100 a 5 5 0 1 1 0 -10 a 5 5 0 0 1 0 10 M 110 98 L 122 82" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.5" fill="none" className="shimmering-icon" style={{ animationDelay: '2s' }} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="hsl(var(--background))" />
            <rect width="100%" height="100%" fill="url(#finance-pattern)" />
        </svg>
    </div>
);

export default function VerifyCodePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showLoading } = useLoadingStore();
    const { toast } = useToast();
    const { isClearMode, theme, setTheme } = useThemeStore();
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);
    const logoControls = useAnimation();

    // Get email and redirect from URL params
    const email = searchParams.get('email') || '';
    const redirectTo = searchParams.get('redirect') || '/onboarding/quiz';
    const isNewUser = searchParams.get('new') === 'true';

    // Code state - 6 digits
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Refs for each input
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const isLightClear = isClearMode && theme === 'light';

    // Logo animation
    useEffect(() => {
        const sequence = async () => {
            await logoControls.start({
                opacity: 1,
                filter: "blur(0px) drop-shadow(0 0 20px hsl(var(--primary) / 0.8)) drop-shadow(0 0 40px hsl(var(--primary) / 0.6))",
                transition: { duration: 1.0, ease: "easeOut", delay: 0.2 }
            });
            await logoControls.start({
                filter: "blur(0px) drop-shadow(0 0 0px transparent)",
                transition: { duration: 2.0, ease: "easeOut" }
            });
        };
        sequence();
    }, [logoControls]);

    // Force dark mode on auth pages
    useEffect(() => {
        if (theme !== 'dark') {
            setTheme('dark');
        }
    }, [theme, setTheme]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle input change
    const handleChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);

        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);
        setError(null);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (digit && index === 5 && newCode.every(d => d !== '')) {
            handleVerify(newCode.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            setError(null);
            inputRefs.current[5]?.focus();
            handleVerify(pastedData);
        }
    };

    // Verify code
    const handleVerify = useCallback(async (verificationCode: string) => {
        if (verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Verification failed');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setIsVerifying(false);
                return;
            }

            // Success!
            toast({
                title: 'Email Verified!',
                description: 'Your email has been successfully verified.',
            });

            showLoading();
            router.push(redirectTo);
        } catch (err) {
            console.error('Verification error:', err);
            setError('Something went wrong. Please try again.');
            setIsVerifying(false);
        }
    }, [email, redirectTo, router, showLoading, toast]);

    // Resend code
    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        setError(null);

        try {
            // Get userId from localStorage (set during signup/signin)
            const userId = localStorage.getItem('pendingVerificationUserId');

            if (!userId) {
                setError('Session expired. Please sign in again.');
                return;
            }

            const response = await fetch('/api/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to resend code');
                return;
            }

            toast({
                title: 'Code Sent!',
                description: 'A new verification code has been sent to your email.',
            });

            setResendCooldown(60);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            console.error('Resend error:', err);
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4">
            <FinanceBackground />
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onAnimationComplete={() => setIsAnimationComplete(true)}
                className="w-full max-w-md relative z-10 flex flex-col items-center"
                style={{ perspective: "1000px" }}
            >
                {/* Logo with glow effect */}
                <motion.div
                    initial={{ opacity: 0, filter: "blur(10px) drop-shadow(0 0 0px transparent)" }}
                    animate={logoControls}
                    className="mt-4 mb-4 relative"
                >
                    <Image
                        src="/Investwise.PNG"
                        alt="InvestWise Logo"
                        width={260}
                        height={70}
                        priority
                        className="object-contain rounded-full"
                    />
                </motion.div>

                <Card
                    className={cn(
                        "w-full relative",
                        isClearMode
                            ? isLightClear
                                ? "bg-card/60 ring-1 ring-white/10"
                                : "bg-white/10 ring-1 ring-white/60"
                            : ""
                    )}
                    style={{ backdropFilter: isClearMode ? "blur(16px)" : "none" }}
                >
                    {isAnimationComplete && <AnimatedBorder />}
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We sent a 6-digit code to
                            <br />
                            <span className="font-medium text-foreground">{email || 'your email'}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Verification Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* 6-digit code input */}
                        <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={isVerifying}
                                    className={cn(
                                        "w-11 h-14 text-center text-2xl font-bold rounded-lg border-2",
                                        "bg-background/50 text-foreground",
                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                                        "transition-all duration-200",
                                        digit ? "border-primary/50" : "border-border",
                                        isVerifying && "opacity-50 cursor-not-allowed"
                                    )}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {/* Verify button */}
                        <Button
                            onClick={() => handleVerify(code.join(''))}
                            disabled={isVerifying || code.some(d => !d)}
                            className="w-full"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>

                        {/* Resend code */}
                        <div className="text-center text-sm text-muted-foreground">
                            Didn&apos;t receive the code?
                            <br />
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleResend}
                                disabled={isResending || resendCooldown > 0}
                                className="px-1"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Sending...
                                    </>
                                ) : resendCooldown > 0 ? (
                                    <>
                                        <RefreshCw className="mr-1 h-3 w-3" />
                                        Resend in {resendCooldown}s
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-1 h-3 w-3" />
                                        Resend Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
