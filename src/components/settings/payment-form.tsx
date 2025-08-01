
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

    useEffect(() => {
        const createSetupIntent = async () => {
            if (user && isTokenReady) {
                setIsLoading(true);
                try {
                    const token = await user.getIdToken(true); // Force refresh the token
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
                    }
                } catch (error) {
                    console.error('Error creating setup intent:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        createSetupIntent();
    }, [user, isTokenReady]);

    if (isLoading || !clientSecret) {
        return (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
        </Elements>
    );
}
