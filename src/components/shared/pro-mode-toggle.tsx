// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { useProModeStore } from '@/store/pro-mode-store';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme-store';

interface ProModeToggleProps {
    className?: string;
    showLabel?: boolean;
}

type AnimationState = "idle" | "rising" | "sliding" | "descending" | "dragging";

export const ProModeToggle: React.FC<ProModeToggleProps> = ({ className, showLabel = true }) => {
    const { isProMode, setProMode } = useProModeStore();
    const { isClearMode, theme } = useThemeStore();
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const gliderRef = useRef<HTMLDivElement>(null);
    const animationStateRef = useRef<AnimationState>("idle");
    const dragStartInfo = useRef<{ x: number; left: number } | null>(null);
    const [gliderStyle, setGliderStyle] = useState<React.CSSProperties>({});

    // Constants for sizes
    const THUMB_SIZE_IDLE = 24;
    const THUMB_SIZE_RISING = 34; // Enlarged but circular
    const TRACK_HEIGHT = 32;
    const PADDING = 4;

    // Initial Setup
    useEffect(() => {
        if (animationStateRef.current === 'idle') {
            updateGliderPosition(isProMode, true);
        }
    }, [isProMode]);

    const updateGliderPosition = useCallback((isPro: boolean, immediate = false) => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const width = container.clientWidth;

        // Target: Idle state is small circle seated on one side
        // Left position calculation
        const left = isPro ? (width - THUMB_SIZE_IDLE - PADDING) : PADDING;

        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_IDLE}px`,
            height: `${THUMB_SIZE_IDLE}px`,
            borderRadius: '50%',
            transform: `translateX(${left}px) translateY(-50%)`,
            top: "50%",
            left: 0,
            position: "absolute",
            backgroundColor: "hsl(var(--primary))",
            opacity: 1,
            transition: immediate ? 'none' : prev.transition,
            border: '1px solid transparent',
            boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
        }));
    }, []);

    const performAnimation = async (targetState: boolean) => {
        if (animationStateRef.current !== 'idle') return;

        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;

        // Start and End positions for the CENTER of the thumb
        // We calculate left style based on size
        const startLeft = targetState ? PADDING : (width - THUMB_SIZE_IDLE - PADDING);
        const endLeft = targetState ? (width - THUMB_SIZE_IDLE - PADDING) : PADDING;

        // For rising state, we center the larger circle on its current anchor point primarily?
        // Actually for the "Move", we want to move from point A to point B.
        // Rise: Scale up, keep roughly same Center X? Or just expand?
        // Let's settle on: Top-Left coordinate logic.

        // Correct Left for Rising State (Larger Circle) centered on same spot?
        // If width increases by (34-24)=10, we shift left by 5 to keep center.
        const riseShift = (THUMB_SIZE_RISING - THUMB_SIZE_IDLE) / 2;
        const risingStartLeft = startLeft - riseShift;
        const risingEndLeft = endLeft - riseShift;

        // 1. RISE
        animationStateRef.current = 'rising';
        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_RISING}px`,
            height: `${THUMB_SIZE_RISING}px`,
            transform: `translateX(${risingStartLeft}px) translateY(-50%)`,
            backgroundColor: isClearMode ? "hsla(0, 0%, 100%, 0.15)" : "hsl(var(--background))",
            boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
            border: '1px solid hsla(0, 0%, 100%, 0.6)',
            backdropFilter: 'blur(16px)',
            zIndex: 20,
            transition: "all 140ms ease-out",
        }));

        await new Promise(r => setTimeout(r, 150));

        // 2. SLIDE
        animationStateRef.current = 'sliding';
        setGliderStyle(prev => ({
            ...prev,
            transform: `translateX(${risingEndLeft}px) translateY(-50%)`,
            transition: "transform 300ms cubic-bezier(0.22, 0.9, 0.35, 1)",
        }));

        await new Promise(r => setTimeout(r, 300));

        // 3. SETTLE (DESCEND)
        animationStateRef.current = 'descending';

        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_IDLE}px`,
            height: `${THUMB_SIZE_IDLE}px`,
            transform: `translateX(${endLeft}px) translateY(-50%)`,
            backgroundColor: "hsl(var(--primary))",
            boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
            border: '1px solid transparent',
            backdropFilter: 'none',
            zIndex: 10,
            transition: "all 160ms ease-in",
        }));

        await new Promise(r => setTimeout(r, 160));

        animationStateRef.current = 'idle';

        // Finalize state update
        setProMode(targetState);
        if (targetState) {
            router.push('/research');
        } else {
            router.push('/goals');
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (animationStateRef.current !== 'idle') return;

        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const currentLeft = isProMode ? (width - THUMB_SIZE_IDLE - PADDING) : PADDING;

        dragStartInfo.current = {
            x: e.clientX,
            left: currentLeft,
        };

        // Lift up - rise animation
        const riseShift = (THUMB_SIZE_RISING - THUMB_SIZE_IDLE) / 2;
        const risingLeft = currentLeft - riseShift;

        animationStateRef.current = 'dragging';
        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_RISING}px`,
            height: `${THUMB_SIZE_RISING}px`,
            transform: `translateX(${risingLeft}px) translateY(-50%)`,
            backgroundColor: isClearMode ? "hsla(0, 0%, 100%, 0.15)" : "hsl(var(--background))",
            boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
            border: '1px solid hsla(0, 0%, 100%, 0.6)',
            backdropFilter: 'blur(16px)',
            zIndex: 20,
            transition: "all 140ms ease-out",
        }));

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd, { once: true });
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (animationStateRef.current !== 'idle') return;

        const container = containerRef.current;
        if (!container) return;

        const touch = e.touches[0];
        const width = container.clientWidth;
        const currentLeft = isProMode ? (width - THUMB_SIZE_IDLE - PADDING) : PADDING;

        dragStartInfo.current = {
            x: touch.clientX,
            left: currentLeft,
        };

        // Lift up - rise animation
        const riseShift = (THUMB_SIZE_RISING - THUMB_SIZE_IDLE) / 2;
        const risingLeft = currentLeft - riseShift;

        animationStateRef.current = 'dragging';
        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_RISING}px`,
            height: `${THUMB_SIZE_RISING}px`,
            transform: `translateX(${risingLeft}px) translateY(-50%)`,
            backgroundColor: isClearMode ? "hsla(0, 0%, 100%, 0.15)" : "hsl(var(--background))",
            boxShadow: "0 10px 18px -6px rgb(0 0 0 / 0.22), 0 6px 10px -8px rgb(0 0 0 / 0.12)",
            border: '1px solid hsla(0, 0%, 100%, 0.6)',
            backdropFilter: 'blur(16px)',
            zIndex: 20,
            transition: "all 140ms ease-out",
        }));

        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd, { once: true });
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (animationStateRef.current !== 'dragging' || !dragStartInfo.current || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;

        const dx = e.clientX - dragStartInfo.current.x;
        const riseShift = (THUMB_SIZE_RISING - THUMB_SIZE_IDLE) / 2;
        let newLeft = dragStartInfo.current.left + dx - riseShift;

        // Clamp to container bounds
        const minLeft = PADDING - riseShift;
        const maxLeft = width - THUMB_SIZE_IDLE - PADDING - riseShift;
        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

        setGliderStyle(prev => ({
            ...prev,
            transform: `translateX(${newLeft}px) translateY(-50%)`,
            transition: "none",
        }));
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
        if (animationStateRef.current !== 'dragging' || !dragStartInfo.current || !containerRef.current) return;

        const touch = e.touches[0];
        const container = containerRef.current;
        const width = container.clientWidth;

        const dx = touch.clientX - dragStartInfo.current.x;
        const riseShift = (THUMB_SIZE_RISING - THUMB_SIZE_IDLE) / 2;
        let newLeft = dragStartInfo.current.left + dx - riseShift;

        // Clamp to container bounds
        const minLeft = PADDING - riseShift;
        const maxLeft = width - THUMB_SIZE_IDLE - PADDING - riseShift;
        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

        setGliderStyle(prev => ({
            ...prev,
            transform: `translateX(${newLeft}px) translateY(-50%)`,
            transition: "none",
        }));
    };

    const handleMouseUp = (e: globalThis.MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        handleRelease(e.clientX);
    };

    const handleTouchEnd = (e: globalThis.TouchEvent) => {
        window.removeEventListener('touchmove', handleTouchMove);
        const touch = e.changedTouches[0];
        handleRelease(touch.clientX);
    };

    const handleRelease = (clientX: number) => {
        if (animationStateRef.current !== 'dragging' || !dragStartInfo.current || !containerRef.current) {
            animationStateRef.current = 'idle';
            return;
        }

        const container = containerRef.current;
        const width = container.clientWidth;
        const containerRect = container.getBoundingClientRect();

        const dropX = clientX - containerRect.left;
        const centerOfTrack = width / 2;

        // Determine which side we're closer to
        const targetState = dropX > centerOfTrack; // true = Pro Mode (right side)

        // Calculate end position
        const endLeft = targetState ? (width - THUMB_SIZE_IDLE - PADDING) : PADDING;

        // Descend animation
        animationStateRef.current = 'descending';
        setGliderStyle(prev => ({
            ...prev,
            width: `${THUMB_SIZE_IDLE}px`,
            height: `${THUMB_SIZE_IDLE}px`,
            transform: `translateX(${endLeft}px) translateY(-50%)`,
            backgroundColor: "hsl(var(--primary))",
            boxShadow: "0 2px 4px -1px rgb(0 0 0 / 0.1)",
            border: '1px solid transparent',
            backdropFilter: 'none',
            zIndex: 10,
            transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }));

        setTimeout(() => {
            animationStateRef.current = 'idle';
            dragStartInfo.current = null;

            // Only navigate if state changed
            if (targetState !== isProMode) {
                setProMode(targetState);
                if (targetState) {
                    router.push('/research');
                } else {
                    router.push('/goals');
                }
            }
        }, 200);
    };

    const handleToggleClick = () => {
        if (animationStateRef.current !== 'idle') return;
        const newState = !isProMode;
        performAnimation(newState);
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            {/* Custom Animated Switch Track */}
            <div
                ref={containerRef}
                onClick={handleToggleClick}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={cn(
                    "relative h-8 w-14 rounded-full cursor-pointer transition-colors",
                    isClearMode
                        ? "bg-white/10 ring-1 ring-white/60"
                        : "bg-muted ring-1 ring-border"
                )}
                style={{ backdropFilter: isClearMode ? "blur(4px)" : "none" }}
            >
                {/* Glider / Thumb */}
                <div
                    ref={gliderRef}
                    className="rounded-full pointer-events-none"
                    style={gliderStyle}
                />
            </div>

            {showLabel && (
                <Label onClick={handleToggleClick} className="flex items-center gap-1 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none">
                    <Zap className={cn("h-3 w-3", isProMode ? "text-primary fill-primary" : "")} />
                    Pro Mode
                </Label>
            )}
        </div>
    );
};
