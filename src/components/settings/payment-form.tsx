
"use client";

import { useState, useEffect } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  onPaymentSuccess: () => void;
}

const CheckoutForm = ({ onPaymentSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch the client secret from our new API endpoint
      fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
            setError(data.error);
        } else {
            setClientSecret(data.clientSecret);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to initialize payment form.");
      });
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !clientSecret) {
      setError("Payment form is not ready yet.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        setError("Card details not found.");
        setLoading(false);
        return;
    }

    const { error: setupError } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: user?.email,
        },
      },
    });

    if (setupError) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: setupError.message,
      });
      setError(setupError.message || 'An unknown error occurred.');
    } else {
      toast({
        title: 'Success!',
        description: 'Your payment method has been saved.',
      });
      // Here you would typically re-fetch the list of payment methods
      onPaymentSuccess();
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#000000',
        fontFamily: '"PT Sans", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#a1a1aa',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border rounded-md">
        <CardElement options={cardElementOptions} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || !clientSecret || loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Card'}
      </Button>
    </form>
  );
};


interface PaymentFormProps {
    onPaymentSuccess: () => void;
}

const PaymentForm = ({ onPaymentSuccess }: PaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
};

export default PaymentForm;
