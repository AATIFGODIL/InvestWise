// InvestWise - A modern stock trading and investment education platform for young investors

import { NextResponse } from 'next/server';
import { getEnvVar } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
  }

  const apiKey = getEnvVar('FINNHUB_API_KEY');

  if (!apiKey) {
    console.error('FINNHUB_API_KEY is not set in the environment.');
    // In a real app, you might want a more robust fallback or error handling.
    // For now, we return an error indicating a server configuration issue.
    return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);

    if (!response.ok) {
      // Forward the error from Finnhub API
      const errorData = await response.text();
      console.error(`Finnhub API error for symbol ${symbol}:`, errorData);
      return NextResponse.json({ error: `Failed to fetch stock data: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
 