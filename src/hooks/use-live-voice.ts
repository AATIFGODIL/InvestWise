// InvestWise - A modern stock trading and investment education platform for young investors
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
    // Stable references for options to prevent re-render loops
    const optionsRef = useRef(options);
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
    // STT for user transcript
    const recognitionRef = useRef<any>(null);

    // Buffer for storing audio chunks to send all at once
    const chunksRef = useRef<string[]>([]);

    // Prevent multiple simultaneous connection attempts
    const isConnectingRef = useRef(false);
    const setupCompleteRef = useRef(false);
    const nextStartTimeRef = useRef(0);

    const disconnect = useCallback(() => {
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

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        if (wsRef.current) {
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
        setupCompleteRef.current = false;
        nextStartTimeRef.current = 0;
        chunksRef.current = [];
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const playAudioChunk = useCallback(async (base64Data: string) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioContext(); // Use native sample rate
            }

            // Resume if suspended (browser requirements)
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

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

            // Schedule seamless playback
            const currentTime = audioContextRef.current.currentTime;
            // If next start time is in the past, reset it to now (plus a tiny buffer)
            if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime + 0.05; // 50ms buffer
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;

            setIsSpeaking(true);

            // Handle when speaking ends
            source.onended = () => {
                if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsSpeaking(false);
                }
            };

        } catch (e) {
            console.error('Audio playback error:', e);
            setIsSpeaking(false);
        }
    }, []);

    const connect = useCallback(async () => {
        // Prevent multiple connection attempts
        if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        isConnectingRef.current = true;

        try {
            console.log('Fetching live token...');
            const tokenRes = await fetch('/api/live-token', { method: 'POST' });
            const tokenData = await tokenRes.json();

            if (!tokenRes.ok) {
                throw new Error(tokenData.error || 'Failed to get token');
            }

            // Check if disconnected while fetching
            if (!isConnectingRef.current) return;

            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${tokenData.token}`;

            console.log('Connecting to WebSocket...');
            const ws = new WebSocket(wsUrl);

            // Wait for both connection AND setup complete
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                ws.onopen = () => {
                    // Check if we were disconnected during connection
                    if (!isConnectingRef.current) {
                        ws.close();
                        clearTimeout(timeout);
                        reject(new Error('Cancelled'));
                        return;
                    }

                    console.log('WebSocket connected, sending setup...');

                    const setupMessage = {
                        setup: {
                            model: `models/${tokenData.model || 'gemini-2.0-flash-exp'}`,
                            generationConfig: {
                                responseModalities: "AUDIO",
                                speechConfig: {
                                    voiceConfig: {
                                        prebuiltVoiceConfig: {
                                            voiceName: 'Aoede',
                                        },
                                    },
                                },
                            },
                            systemInstruction: {
                                parts: [{
                                    text: optionsRef.current.systemInstruction || 'You are a helpful AI assistant.'
                                }],
                            },
                            tools: [
                                { google_search: {} }
                            ],
                        },
                    };

                    console.log('Sending setup message:', JSON.stringify(setupMessage, null, 2));
                    ws.send(JSON.stringify(setupMessage));
                    wsRef.current = ws;
                    chunksRef.current = []; // Reset buffer
                };

                ws.onmessage = async (event) => {
                    try {
                        const data = typeof event.data === 'string'
                            ? JSON.parse(event.data)
                            : JSON.parse(await event.data.text());

                        // Setup complete - resolve the promise
                        if (data.setupComplete) {
                            console.log('Setup complete');
                            clearTimeout(timeout);
                            setupCompleteRef.current = true;
                            setIsConnected(true);
                            isConnectingRef.current = false;
                            resolve();
                            return;
                        }

                        // Handle server responses
                        if (data.serverContent) {
                            const { modelTurn, interrupted } = data.serverContent;

                            if (interrupted) {
                                setIsSpeaking(false);
                                return;
                            }

                            if (modelTurn?.parts) {
                                for (const part of modelTurn.parts) {
                                    if (part.inlineData?.data) {
                                        await playAudioChunk(part.inlineData.data);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing message:', e);
                    }
                };

                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('WebSocket error:', error);
                    reject(new Error('Connection error'));
                };

                ws.onclose = (event) => {
                    clearTimeout(timeout);
                    console.log('WebSocket closed', event.code, event.reason);

                    if (!event.wasClean && event.code !== 1000) {
                        optionsRef.current.onError?.(`Connection closed: ${event.reason || 'Unknown error'}`);
                    }

                    setIsConnected(false);
                    setIsListening(false);
                    wsRef.current = null;
                    setupCompleteRef.current = false;

                    if (!setupCompleteRef.current) {
                        reject(new Error(`Connection closed: ${event.reason || 'Unknown'}`));
                    }
                };
            });

        } catch (error: any) {
            console.error('Connection error:', error);
            optionsRef.current.onError?.(error.message || 'Failed to connect');
            disconnect();
            throw error;
        }
    }, [disconnect, playAudioChunk]);

    const startListening = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !setupCompleteRef.current) {
            optionsRef.current.onError?.('Not connected or setup incomplete');
            return;
        }

        try {
            // Reset buffer
            chunksRef.current = [];

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
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert chunk to binary string
                let binary = '';
                const bytes = new Uint8Array(pcmData.buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }

                // Store chunk in buffer instead of sending immediately
                chunksRef.current.push(binary);
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            // Start Web Speech API for user transcription
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript && optionsRef.current.onTranscript) {
                        optionsRef.current.onTranscript(finalTranscript, true); // true = User
                    }
                };

                recognition.start();
                recognitionRef.current = recognition;
            }

            setIsListening(true);

        } catch (error: any) {
            console.error('Microphone error:', error);
            optionsRef.current.onError?.('Microphone access denied');
        }
    }, []);

    const stopListening = useCallback(() => {
        // Stop recording
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setIsListening(false);

        // Send accumulated audio if we have any
        if (wsRef.current?.readyState === WebSocket.OPEN && chunksRef.current.length > 0) {
            console.log(`Sending ${chunksRef.current.length} chunks of audio...`);

            // Combine all chunks
            const fullBinary = chunksRef.current.join('');
            const base64 = btoa(fullBinary);

            // Send audio payload
            wsRef.current.send(JSON.stringify({
                realtimeInput: {
                    mediaChunks: [{
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64,
                    }],
                },
            }));

            // Clear buffer
            chunksRef.current = [];
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

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
