// InvestWise - A modern stock trading and investment education platform for young investors

import { NextResponse } from 'next/server';
import { getEnvVar } from '@/lib/env';

export async function GET() {
  const apiKey = getEnvVar('FINNHUB_API_KEY');

  if (!apiKey) {
    console.error('FINNHUB_API_KEY is not set in the environment.');
    return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${apiKey}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Finnhub API error for market status:', errorData);
      return NextResponse.json({ error: `Failed to fetch market status: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching market status:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
 