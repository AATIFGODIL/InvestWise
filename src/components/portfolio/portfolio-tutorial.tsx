// InvestWise - A modern stock trading and investment education platform for young investors
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

interface PortfolioTutorialProps {
    onComplete: () => void;
}

// Define where the tooltip text should appear relative to the highlighted element
type TextPosition = 'over-element' | 'top-center' | 'over-sibling' | 'top-of-element' | 'beside-right';
type StepType = 'auto' | 'interactive-click' | 'interactive-dialog-close';

interface Step {
    id: number;
    title: string;
    description: string;
    highlight: string;
    textPosition: TextPosition;
    // Optional: ID of the element to position text over (for 'over-sibling')
    textOverElementId?: string;
    // Step type: auto (7s timer) or interactive (waits for user)
    stepType?: StepType;
    // If true, transition from previous step smoothly without exit animation
    seamlessFromPrevious?: boolean;
}

const steps: Step[] = [
    {
        id: 0,
        title: '',
        description: 'This is the same portfolio overview you saw on the Explore page.',
        highlight: 'portfolio-value-tutorial',
        textPosition: 'top-of-element',
    },
    {
        id: 1,
        title: '',
        description: 'These are all your holdings. Check out your daily change, total gain/loss, and your annual rate.',
        highlight: 'holdings-section-tutorial',
        textPosition: 'top-center',
    },
    {
        id: 2,
        title: '',
        description: 'Click to check your past trades.',
        highlight: 'trade-history-button-tutorial',
        textPosition: 'beside-right',
        stepType: 'interactive-click',
        seamlessFromPrevious: true, // Smooth zoom from holdings
    },
    {
        id: 3,
        title: '',
        description: '', // No text for this step, just highlight the X button
        highlight: 'trade-history-close-button-tutorial',
        textPosition: 'top-center',
        stepType: 'interactive-dialog-close',
    },
    {
        id: 4,
        title: '',
        description: 'Track stocks you\'re interested in. Also available on the Explore page.',
        highlight: 'watchlist-portfolio-tutorial',
        textPosition: 'top-of-element',
    },
    {
        id: 5,
        title: '',
        description: 'Set up recurring investments to grow your portfolio automatically. Also on Explore.',
        highlight: 'auto-invest-portfolio-tutorial',
        textPosition: 'over-sibling',
        textOverElementId: 'ai-prediction-portfolio-tutorial',
    },
    {
        id: 6,
        title: '',
        description: 'Get AI-powered insights on potential stock movements. Also on Explore.',
        highlight: 'ai-prediction-portfolio-tutorial',
        textPosition: 'over-sibling',
        textOverElementId: 'auto-invest-portfolio-tutorial',
    },
];

interface TooltipPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default function PortfolioTutorial({ onComplete }: PortfolioTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
    const [textTooltipPosition, setTextTooltipPosition] = useState<TooltipPosition | null>(null);
    const [showBlur, setShowBlur] = useState(false);
    const [animateSwipe, setAnimateSwipe] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    // Determine swipe bar color based on theme
    const getSwipeColor = () => {
        if (isClearMode) {
            return isLightClear
                ? 'rgba(255, 255, 255, 0.25)'
                : 'rgba(255, 255, 255, 0.15)';
        }
        return theme === 'dark' ? 'white' : 'black';
    };

    // Split description into lines for alternating swipe effect
    const splitTextIntoLines = (text: string, maxCharsPerLine: number = 60): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    };

    // Function to calculate and set the highlight position
    const updateHighlight = useCallback(() => {
        const currentStep = steps[currentStepIndex];

        // Clear any previous highlight and glow classes
        document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
            el.classList.remove('tutorial-highlight-active');
            el.classList.remove('tutorial-highlight-glow-light');
            el.classList.remove('tutorial-highlight-glow-dark');
            el.classList.remove('tutorial-shimmer-glow');
        });
        document.querySelectorAll('.tutorial-highlight-parent-active').forEach(el => {
            el.classList.remove('tutorial-highlight-parent-active');
        });

        // --- POLLING LOGIC ---
        const findElement = (retriesLeft: number) => {
            const element = document.getElementById(currentStep.highlight);

            if (element) {
                const rect = element.getBoundingClientRect();

                // First scroll the element into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('tutorial-highlight-active');

                // Add themed glow for interactive steps
                if (currentStep.stepType === 'interactive-click') {
                    element.classList.add(theme === 'dark' ? 'tutorial-highlight-glow-dark' : 'tutorial-highlight-glow-light');

                    // Elevate parent containers to escape stacking context
                    // Find and elevate the holdings section card
                    const holdingsSection = document.getElementById('holdings-section-tutorial');
                    if (holdingsSection) {
                        holdingsSection.classList.add('tutorial-highlight-parent-active');
                    }
                }

                // Add shimmer animation for dialog close button
                if (currentStep.stepType === 'interactive-dialog-close') {
                    element.classList.add('tutorial-shimmer-glow');
                }

                // Wait for scroll to complete, then recalculate positions
                setTimeout(() => {
                    const finalRect = element.getBoundingClientRect();
                    const highlightPos = {
                        top: finalRect.top,
                        left: finalRect.left,
                        width: finalRect.width,
                        height: finalRect.height,
                    };
                    setTooltipPosition(highlightPos);

                    // Calculate text position based on textPosition property
                    let textPos: TooltipPosition;

                    if (currentStep.textPosition === 'top-center') {
                        const safeWidth = Math.min(window.innerWidth - 40, 800);
                        textPos = {
                            top: 100,
                            left: (window.innerWidth - safeWidth) / 2,
                            width: safeWidth,
                            height: 250,
                        };
                    } else if (currentStep.textPosition === 'top-of-element') {
                        textPos = {
                            top: finalRect.top + 20,
                            left: finalRect.left,
                            width: finalRect.width,
                            height: 250,
                        };
                    } else if (currentStep.textPosition === 'beside-right') {
                        // Position text to the right of the element
                        textPos = {
                            top: finalRect.top + (finalRect.height / 2) - 20,
                            left: finalRect.right + 20,
                            width: Math.min(window.innerWidth - finalRect.right - 40, 400),
                            height: 100,
                        };
                    } else if (currentStep.textPosition === 'over-sibling' && currentStep.textOverElementId) {
                        const siblingElement = document.getElementById(currentStep.textOverElementId);
                        if (siblingElement) {
                            const siblingRect = siblingElement.getBoundingClientRect();
                            textPos = {
                                top: siblingRect.top,
                                left: siblingRect.left,
                                width: siblingRect.width,
                                height: siblingRect.height,
                            };
                        } else {
                            textPos = highlightPos;
                        }
                    } else {
                        textPos = highlightPos;
                    }

                    setTextTooltipPosition(textPos);
                    setShowBlur(true);
                    setTimeout(() => setAnimateSwipe(true), 100);
                }, 400);
            } else if (retriesLeft > 0) {
                setTimeout(() => findElement(retriesLeft - 1), 50);
            } else {
                console.error(`PORTFOLIO TUTORIAL ERROR: Element not found: ${currentStep.highlight}`);
                onComplete();
            }
        };

        findElement(40);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStepIndex]);

    // Run on initial mount and when the step changes
    useEffect(() => {
        updateHighlight();
        window.addEventListener('resize', updateHighlight);
        return () => {
            window.removeEventListener('resize', updateHighlight);
            document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
                el.classList.remove('tutorial-highlight-active');
                el.classList.remove('tutorial-highlight-glow-light');
                el.classList.remove('tutorial-highlight-glow-dark');
                el.classList.remove('tutorial-shimmer-glow');
            });
            document.querySelectorAll('.tutorial-highlight-parent-active').forEach(el => {
                el.classList.remove('tutorial-highlight-parent-active');
            });
        };
    }, [updateHighlight]);

    // Lock body scroll when the tutorial is active
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Auto-advance timer for auto steps, event listeners for interactive steps
    useEffect(() => {
        const currentStep = steps[currentStepIndex];
        const stepType = currentStep?.stepType;

        if (stepType === 'interactive-click') {
            const handleClick = () => handleNext();
            window.addEventListener('tradeHistoryButtonClicked', handleClick);
            return () => window.removeEventListener('tradeHistoryButtonClicked', handleClick);
        }

        if (stepType === 'interactive-dialog-close') {
            const handleClose = () => handleNext();
            window.addEventListener('tradeHistoryClosed', handleClose);
            return () => window.removeEventListener('tradeHistoryClosed', handleClose);
        }

        // For auto steps, use the 7-second timer
        const timer = setTimeout(() => {
            handleNext();
        }, 7000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStepIndex]);

    const handleNext = () => {
        if (isExiting) return;

        const nextStepIndex = currentStepIndex + 1;
        const nextStep = steps[nextStepIndex];

        // Check if next step should be a seamless transition (no exit animation)
        if (nextStep?.seamlessFromPrevious) {
            // Skip exit animation - just update text position while keeping blur
            setAnimateSwipe(false);

            // Clear current highlight classes immediately for seamless transition
            document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
                el.classList.remove('tutorial-highlight-active');
                el.classList.remove('tutorial-highlight-glow-light');
                el.classList.remove('tutorial-highlight-glow-dark');
                el.classList.remove('tutorial-shimmer-glow');
            });
            document.querySelectorAll('.tutorial-highlight-parent-active').forEach(el => {
                el.classList.remove('tutorial-highlight-parent-active');
            });

            // Brief delay for text fade out, then update step
            setTimeout(() => {
                setCurrentStepIndex(nextStepIndex);
            }, 300);
            return;
        }

        // Normal transition with full exit animation
        setIsExiting(true);
        setAnimateSwipe(false);

        setTimeout(() => {
            setShowBlur(false);
            setTooltipPosition(null);
            setTextTooltipPosition(null);
            setIsExiting(false);

            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
            } else {
                onComplete();
            }
        }, 600);
    };

    const handleSkip = () => {
        if (isExiting) return;
        setIsExiting(true);
        setAnimateSwipe(false);

        setTimeout(() => {
            setShowBlur(false);
            setTooltipPosition(null);
            setTextTooltipPosition(null);
            setIsExiting(false);
            onComplete();
        }, 600);
    };

    const step = steps[currentStepIndex];
    if (!step || !tooltipPosition || !textTooltipPosition) return null;

    const descriptionLines = splitTextIntoLines(step.description, 70);
    const isInteractiveStep = step.stepType?.startsWith('interactive');
    const isDialogCloseStep = step.stepType === 'interactive-dialog-close';

    return (
        <>
            {showBlur && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
                    style={{
                        backdropFilter: 'blur(8px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleSkip}
                />
            )}

            {/* Special handling for dialog close step - just show square X in top right */}
            {isDialogCloseStep ? (
                <motion.div
                    className="fixed top-4 right-4 z-[140] pointer-events-auto"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSkip}
                        className="h-10 w-10 text-white hover:text-white hover:bg-white/10 border border-white/30 rounded-md"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    key={`tooltip-${step.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        top: `${textTooltipPosition.top}px`,
                        left: `${textTooltipPosition.left}px`,
                        width: `${textTooltipPosition.width}px`,
                        height: `${textTooltipPosition.height}px`,
                    }}
                    className="flex justify-center items-start z-[140] pointer-events-auto overflow-visible"
                >
                    {/* Main container with text and buttons side by side */}
                    <div className={cn(
                        "text-white p-6 flex gap-2 items-start",
                        step.textPosition === 'beside-right' ? 'flex-row' : 'flex-row-reverse'
                    )}>
                        {/* Buttons stacked vertically */}
                        <motion.div
                            className="flex flex-col gap-2 shrink-0"
                            initial={{ opacity: 0 }}
                            animate={
                                isExiting
                                    ? { opacity: 0 }
                                    : animateSwipe
                                        ? { opacity: 1 }
                                        : { opacity: 0 }
                            }
                            transition={{
                                duration: 0.375,
                                delay: isExiting ? 0 : 0.5 + (descriptionLines.length * 0.1875)
                            }}
                        >
                            {!isInteractiveStep && (
                                <Button variant="ghost" size="sm" onClick={handleNext} className="text-white hover:text-white hover:bg-white/10 justify-start">
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-white hover:text-white hover:bg-white/10 justify-start">
                                <X className="mr-2 h-4 w-4" /> Skip
                            </Button>
                        </motion.div>

                        {/* Text content */}
                        <div className={cn("flex-1", step.textPosition === 'beside-right' ? 'text-left' : 'text-center')}>
                            {/* Title with Swipe Reveal */}
                            {step.title && (
                                <div className={cn("mb-2", step.textPosition === 'beside-right' ? '' : 'flex justify-center')}>
                                    <div className="relative overflow-hidden w-fit inline-block rounded-full">
                                        <motion.h3
                                            className="font-bold text-2xl drop-shadow-md px-2 py-1"
                                            initial={{ opacity: 0 }}
                                            animate={
                                                isExiting
                                                    ? { opacity: 0 }
                                                    : animateSwipe
                                                        ? { opacity: 1 }
                                                        : { opacity: 0 }
                                            }
                                            transition={{
                                                duration: 0.01,
                                                delay: isExiting ? 0 : 0.5
                                            }}
                                        >
                                            {step.title}
                                        </motion.h3>
                                        <motion.div
                                            className="absolute inset-0 z-20"
                                            style={{
                                                backgroundColor: getSwipeColor(),
                                                backdropFilter: isClearMode ? 'blur(12px)' : 'none',
                                                borderRadius: '9999px',
                                            }}
                                            initial={{ x: '-101%' }}
                                            animate={
                                                isExiting
                                                    ? { x: ['101%', '0%', '-101%'] }
                                                    : animateSwipe
                                                        ? { x: ['-101%', '0%', '101%'] }
                                                        : { x: '-101%' }
                                            }
                                            transition={{
                                                times: [0, 0.5, 1],
                                                duration: isExiting ? 0.625 : 0.75,
                                                delay: isExiting ? descriptionLines.length * 0.1 : 0,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Line-by-line Swipe Reveal for Description */}
                            <div className="space-y-1">
                                {descriptionLines.map((line, index) => (
                                    <div key={index} className={step.textPosition === 'beside-right' ? '' : 'flex justify-center'}>
                                        <div className="relative overflow-hidden w-fit inline-block rounded-full">
                                            <motion.p
                                                className="text-base drop-shadow-md px-2 py-1 whitespace-nowrap"
                                                initial={{ opacity: 0 }}
                                                animate={
                                                    isExiting
                                                        ? { opacity: 0 }
                                                        : animateSwipe
                                                            ? { opacity: 1 }
                                                            : { opacity: 0 }
                                                }
                                                transition={{
                                                    duration: 0.01,
                                                    delay: isExiting ? 0 : 0.5 + ((index + 1) * 0.1875)
                                                }}
                                            >
                                                {line}
                                            </motion.p>
                                            <motion.div
                                                className="absolute inset-0 z-20"
                                                style={{
                                                    backgroundColor: getSwipeColor(),
                                                    backdropFilter: isClearMode ? 'blur(12px)' : 'none',
                                                    borderRadius: '9999px',
                                                }}
                                                initial={{ x: '-101%' }}
                                                animate={
                                                    isExiting
                                                        ? { x: ['101%', '0%', '-101%'] }
                                                        : animateSwipe
                                                            ? { x: ['-101%', '0%', '101%'] }
                                                            : { x: '-101%' }
                                                }
                                                transition={{
                                                    times: [0, 0.5, 1],
                                                    duration: isExiting ? 0.625 : 0.75,
                                                    delay: isExiting
                                                        ? (descriptionLines.length - 1 - index) * 0.1
                                                        : (index + 1) * 0.1875,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}
