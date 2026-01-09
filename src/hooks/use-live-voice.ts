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
    sendText: (text: string) => void;
}

export function useLiveVoice(options: UseLiveVoiceOptions = {}): UseLiveVoiceReturn {
    // 1. Stable references for options to prevent unnecessary re-renders/re-connections
    const optionsRef = useRef(options);

    // Update refs whenever options change (without triggering other effects)
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);

    // Track connection state to handle Strict Mode / race conditions
    const isConnectingRef = useRef(false);

    const disconnect = useCallback(() => {
        // Stop audio processing
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Close WebSocket
        if (wsRef.current) {
            // Remove listeners to prevent "onclose" triggering state updates during intentional disconnect
            wsRef.current.onclose = null;
            wsRef.current.onerror = null;
            wsRef.current.onmessage = null;
            wsRef.current.onopen = null;

            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        isConnectingRef.current = false;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const connect = useCallback(async () => {
        // Prevent multiple connection attempts or connecting while already connected
        if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) return;

        isConnectingRef.current = true;

        try {
            console.log('Fetching live token...');
            const tokenRes = await fetch('/api/live-token', { method: 'POST' });
            const tokenData = await tokenRes.json();

            if (!tokenRes.ok) {
                throw new Error(tokenData.error || 'Failed to get token');
            }

            // If user disconnected while fetch was happening, abort
            if (!isConnectingRef.current) return;

            // Use v1alpha for gemini-2.0-flash-exp
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${tokenData.token}`;

            console.log('Connecting to WebSocket...');
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                if (!isConnectingRef.current) {
                    ws.close();
                    return;
                }

                console.log('WebSocket connected');

                const setupMessage = {
                    setup: {
                        model: `models/${tokenData.model || 'gemini-2.0-flash-exp'}`, // Fallback model if token doesn't provide one
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
                            parts: [{ text: optionsRef.current.systemInstruction || 'You are a helpful AI assistant.' }],
                        },
                    },
                };

                ws.send(JSON.stringify(setupMessage));
                wsRef.current = ws;
                setIsConnected(true);
                isConnectingRef.current = false;
            };

            ws.onmessage = async (event) => {
                try {
                    const data = typeof event.data === 'string'
                        ? JSON.parse(event.data)
                        : JSON.parse(await event.data.text());

                    if (data.setupComplete) {
                        console.log('Setup complete');
                        return;
                    }

                    if (data.serverContent) {
                        const { modelTurn, interrupted } = data.serverContent;
                        if (interrupted) {
                            setIsSpeaking(false);
                            return;
                        }

                        if (modelTurn?.parts) {
                            for (const part of modelTurn.parts) {
                                if (part.text && optionsRef.current.onTranscript) {
                                    optionsRef.current.onTranscript(part.text, false);
                                }
                                if (part.inlineData?.data) {
                                    await playAudioChunk(part.inlineData.data);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Don't trigger error if we are just disconnecting
                if (isConnectingRef.current || isConnected) {
                    optionsRef.current.onError?.('Connection error');
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed', event.code, event.reason);

                // If closed by server with an error code
                if (!event.wasClean && event.code !== 1000) {
                    optionsRef.current.onError?.(`Disconnected: ${event.reason || 'Unknown error'}`);
                }

                setIsConnected(false);
                setIsListening(false);
                wsRef.current = null;
                isConnectingRef.current = false;
            };

        } catch (error: any) {
            console.error('Connection error:', error);
            optionsRef.current.onError?.(error.message || 'Failed to connect');
            isConnectingRef.current = false;
        }
    }, [disconnect]); // Removed unstable dependencies

    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            optionsRef.current.onError?.('Not connected');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            mediaStreamRef.current = stream;
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            // Using 512 buffer size for lower latency, though 2048/4096 is safer for performance
            const processor = audioContext.createScriptProcessor(2048, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = event.inputBuffer.getChannelData(0);

                // Optimized PCM conversion
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Base64 encoding
                let binary = '';
                const bytes = new Uint8Array(pcmData.buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);

                wsRef.current.send(JSON.stringify({
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: 'audio/pcm;rate=16000',
                            data: base64,
                        }],
                    },
                }));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            setIsListening(true);

        } catch (error: any) {
            console.error('Microphone error:', error);
            optionsRef.current.onError?.('Microphone access denied');
        }
    }, []); // Removed options dependency

    const stopListening = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
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
        // Reuse context or create new if missing (but ideally reuse to avoid limit)
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }

        setIsSpeaking(true);
        try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const pcmData = new Int16Array(bytes.buffer);
            const floatData = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 32768;
            }

            const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
            buffer.getChannelData(0).set(floatData);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsSpeaking(false);
            source.start();
        } catch (e) {
            console.error(e);
            setIsSpeaking(false);
        }
    }, []);

    const sendText = useCallback((text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                client_content: {
                    turns: [{ role: 'user', parts: [{ text }] }],
                    turn_complete: true
                }
            }));
        }
    }, []);

    return {
        isConnected,
        isListening,
        isSpeaking,
        connect,
        disconnect,
        toggleListening,
        sendText,
    };
}
