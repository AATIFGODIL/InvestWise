
"use client";

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './checkout-form';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '../ui/skeleton';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface PaymentFormProps {
    onPaymentSuccess: () => void;
}

export default function PaymentForm({ onPaymentSuccess }: PaymentFormProps) {
    const { user, hydrating } = useAuth();
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hydrating) {
            return; // Wait until auth state is determined
        }
        if (!user) {
            setError("You must be logged in to add a payment method.");
            setIsLoading(false);
            return;
        }

        const createSetupIntent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = await user.getIdToken(true);
                const response = await fetch('/api/create-setup-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create setup intent.');
                }
                
                setClientSecret(data.clientSecret);
            } catch (err: any) {
                console.error("Error fetching setup intent:", err);
                setError(err.message || 'Could not connect to the server to initialize payments.');
            } finally {
                setIsLoading(false);
            }
        };

        createSetupIntent();
    }, [user, hydrating]);

    if (isLoading) {
        return (
            <div className="space-y-4 pt-4">
                <p className="text-sm text-center text-muted-foreground">Initializing secure payment form...</p>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    if (error) {
        return <p className="text-destructive text-sm text-center p-4 bg-destructive/10 rounded-md">{error}</p>;
    }

    if (!clientSecret) {
      return <p className="text-destructive text-sm text-center p-4 bg-destructive/10 rounded-md">Could not initialize payment form. Please try again later.</p>
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
        </Elements>
    );
}
