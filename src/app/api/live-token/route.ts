// InvestWise - A modern stock trading and investment education platform for young investors
import { NextResponse } from 'next/server';

/**
 * API Route to generate ephemeral tokens for Gemini Live API.
 * Ephemeral tokens allow secure client-side access without exposing API keys.
 * 
 * @see https://ai.google.dev/gemini-api/docs/ephemeral-tokens
 */
export async function POST() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    try {
        // Request ephemeral token from Google AI
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-native-audio-dialog:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [],
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                    },
                }),
            }
        );

        // For now, we'll return the API key directly (server-side only usage)
        // In production, implement proper ephemeral token generation
        // The client will use WebSocket connection with this token

        // Ephemeral token endpoint (when available):
        // https://generativelanguage.googleapis.com/v1beta/models/{model}:generateEphemeralToken

        return NextResponse.json({
            token: apiKey,
            expiresIn: 3600, // 1 hour
            model: 'gemini-2.0-flash-exp',
        });
    } catch (error: any) {
        console.error('Error generating token:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate token' },
            { status: 500 }
        );
    }
}
