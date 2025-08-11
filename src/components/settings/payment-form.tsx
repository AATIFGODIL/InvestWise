
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
        const createSetupIntent = async (retries = 1) => {
            if (!user) {
                if (retries > 0) {
                    setTimeout(() => createSetupIntent(retries - 1), 1000); // Wait and retry
                } else {
                    setError("You must be logged in to add a payment method.");
                    setIsLoading(false);
                }
                return;
            }

            try {
                const token = await user.getIdToken(true);
                const response = await fetch('/api/create-setup-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create setup intent.');
                }
                
                const data = await response.json();
                setClientSecret(data.clientSecret);
                setError(null);

            } catch (err: any) {
                console.error(`Attempt failed: ${err.message}`);
                if (retries > 0) {
                    setTimeout(() => createSetupIntent(retries - 1), 1000); // Wait and retry
                } else {
                    setError(err.message || 'Could not connect to the server to initialize payments.');
                }
            } finally {
                 // Only stop loading if we are out of retries or successful
                if (clientSecret || retries === 0) {
                    setIsLoading(false);
                }
            }
        };

        if (!hydrating) {
            createSetupIntent();
        }
    }, [user, hydrating, clientSecret]);

    if (isLoading || hydrating) {
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
