
"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Make sure to add your publishable key to your .env file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function AddFunds() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(value);
    }

    const redirectToCheckout = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid amount to add.',
            });
            return;
        }

        setLoading(true);

        try {
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("Stripe.js has not loaded yet.");
            }
            
            const amountInCents = Math.round(parseFloat(amount) * 100);

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountInCents, email: user?.email }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to create checkout session.');
            }

            const session = await response.json();
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error("Stripe Error:", error);
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: error.message || 'An unexpected error occurred.',
            });
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CreditCard className="mr-2 h-4 w-4" /> Add Funds
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Funds to Your Account</DialogTitle>
                    <DialogDescription>
                        Enter the amount you would like to add. You will be redirected to Stripe to complete the payment.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="amount"
                                type="text"
                                placeholder="100.00"
                                value={amount}
                                onChange={handleAmountChange}
                                className="pl-8"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={redirectToCheckout} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Continue to Stripe
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
