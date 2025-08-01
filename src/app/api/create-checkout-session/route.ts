
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, email } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:9002';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Add Funds to InvestWise',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/portfolio?payment_status=success`,
      cancel_url: `${origin}/portfolio?payment_status=cancelled`,
      customer_email: email,
    });

    if (session.id) {
        return NextResponse.json({ id: session.id }, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Could not create a checkout session' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
