
"use client";

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, type FormEvent } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
    onPaymentSuccess: () => void;
}

export default function CheckoutForm({ onPaymentSuccess }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        if (!stripe || !elements) {
            console.log('Stripe.js has not loaded yet.');
            setIsLoading(false);
            return;
        }

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/settings`,
            },
            redirect: 'if_required', // Prevents immediate redirection
        });
        
        if (error) {
            setErrorMessage(error.message ?? "An unexpected error occurred.");
            setIsLoading(false);
        } else {
            // The payment method was saved successfully.
            toast({
                title: "Success!",
                description: "Your payment method has been saved securely."
            });
            onPaymentSuccess();
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {errorMessage && <div className="text-destructive text-sm mt-2">{errorMessage}</div>}
            <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    "Save Card"
                )}
            </Button>
        </form>
    )
}
