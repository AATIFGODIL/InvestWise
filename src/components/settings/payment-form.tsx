
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
    const { user, isTokenReady } = useAuth();
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createSetupIntent = async () => {
            if (user && isTokenReady) {
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
                    if (response.ok) {
                        setClientSecret(data.clientSecret);
                    } else {
                        console.error('Failed to create setup intent:', data.error);
                        setError(data.error || 'An unexpected error occurred.');
                    }
                } catch (error) {
                    console.error('Error creating setup intent:', error);
                    setError('Could not connect to the server to initialize payments.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (user && isTokenReady) {
          createSetupIntent();
        } else if (!isTokenReady && !user) {
          // If the auth state is determined and there's no user, stop loading.
          setIsLoading(false);
          setError("You must be logged in to add a payment method.")
        }
    }, [user, isTokenReady]);

    if (isLoading) {
        return (
            <div className="space-y-4 pt-4">
                <p className="text-sm text-center text-muted-foreground">Initializing secure payment form...</p>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    if (error || !clientSecret) {
        return <p className="text-destructive text-sm text-center p-4 bg-destructive/10 rounded-md">{error || 'Could not initialize payment form. Please try again later.'}</p>
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
        </Elements>
    );
}
