'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseLiveVoiceOptions {
    systemInstruction?: string;
    onTranscript?: (text: string, isUser: boolean) => void;
    onError?: (error: string) => void;
}

interface UseLiveVoiceReturn {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    toggleListening: () => void;
}

/**
 * Custom hook for Gemini Live API voice interactions.
 * Handles WebSocket connection, audio capture, and playback.
 */
export function useLiveVoice(options: UseLiveVoiceOptions = {}): UseLiveVoiceReturn {
    const { systemInstruction, onTranscript, onError } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const isPlayingRef = useRef(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    const connect = useCallback(async () => {
        try {
            // Get token from our API
            const tokenRes = await fetch('/api/live-token', { method: 'POST' });
            const tokenData = await tokenRes.json();

            if (!tokenRes.ok) {
                throw new Error(tokenData.error || 'Failed to get token');
            }

            // Connect to Gemini Live API via WebSocket
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${tokenData.token}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');

                // Send setup message
                const setupMessage = {
                    setup: {
                        model: `models/${tokenData.model}`,
                        generationConfig: {
                            responseModalities: ['AUDIO', 'TEXT'],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: 'Aoede',
                                    },
                                },
                            },
                        },
                        systemInstruction: {
                            parts: [{ text: systemInstruction || 'You are a helpful AI assistant for InvestWise, a youth investment app. Be friendly, clear, and educational.' }],
                        },
                    },
                };

                ws.send(JSON.stringify(setupMessage));
                setIsConnected(true);
            };

            ws.onmessage = async (event) => {
                const data = typeof event.data === 'string'
                    ? JSON.parse(event.data)
                    : JSON.parse(await event.data.text());

                // Handle setup complete
                if (data.setupComplete) {
                    console.log('Setup complete');
                    return;
                }

                // Handle server content (audio/text response)
                if (data.serverContent) {
                    const { modelTurn, interrupted } = data.serverContent;

                    if (interrupted) {
                        // Clear audio queue on interruption
                        audioQueueRef.current = [];
                        setIsSpeaking(false);
                        return;
                    }

                    if (modelTurn?.parts) {
                        for (const part of modelTurn.parts) {
                            // Handle text response
                            if (part.text) {
                                onTranscript?.(part.text, false);
                            }

                            // Handle audio response
                            if (part.inlineData?.data) {
                                await playAudioChunk(part.inlineData.data);
                            }
                        }
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError?.('Connection error');
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setIsConnected(false);
                setIsListening(false);
            };

        } catch (error: any) {
            console.error('Connection error:', error);
            onError?.(error.message || 'Failed to connect');
        }
    }, [systemInstruction, onTranscript, onError]);

    const disconnect = useCallback(() => {
        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Stop media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
    }, []);

    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            onError?.('Not connected');
            return;
        }

        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            mediaStreamRef.current = stream;

            // Create audio context
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = event.inputBuffer.getChannelData(0);

                // Convert to 16-bit PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }

                // Convert to base64
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));

                // Send audio to Gemini
                const message = {
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: 'audio/pcm;rate=16000',
                            data: base64,
                        }],
                    },
                };

                wsRef.current.send(JSON.stringify(message));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsListening(true);

        } catch (error: any) {
            console.error('Microphone error:', error);
            onError?.('Microphone access denied');
        }
    }, [onError]);

    const stopListening = useCallback(() => {
        // Stop processor
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        // Stop media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    const playAudioChunk = useCallback(async (base64Data: string) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }

        setIsSpeaking(true);

        try {
            // Decode base64 to bytes
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Int16Array (PCM data)
            const pcmData = new Int16Array(bytes.buffer);

            // Convert to Float32Array for Web Audio API
            const floatData = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 32768;
            }

            // Create audio buffer
            const audioBuffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
            audioBuffer.getChannelData(0).set(floatData);

            // Play audio
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsSpeaking(false);
            };
            source.start();

        } catch (error) {
            console.error('Audio playback error:', error);
            setIsSpeaking(false);
        }
    }, []);

    return {
        isConnected,
        isListening,
        isSpeaking,
        connect,
        disconnect,
        toggleListening,
    };
}
