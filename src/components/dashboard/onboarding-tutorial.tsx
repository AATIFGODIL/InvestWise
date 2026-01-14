// InvestWise - A modern stock trading and investment education platform for young investors
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

// Define where the tooltip text should appear relative to the highlighted element
type TextPosition = 'over-element' | 'top-center' | 'over-sibling' | 'top-of-element' | 'above-bottom-nav-center' | 'above-bottom-nav-left';
type StepType = 'auto' | 'interactive-drag-start' | 'interactive-drag-end';

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
}

const steps: Step[] = [
  {
    id: 0,
    title: 'Welcome to InvestWise.',
    description: 'Lets begin.',
    highlight: 'intro-step',
    textPosition: 'over-element',
  },
  {
    id: 1,
    title: '',
    description: 'This is your main portfolio overview. Track your total value and how your investments are performing over time.',
    highlight: 'portfolio-card-tutorial',
    textPosition: 'top-of-element',
  },
  {
    id: 2,
    title: '',
    description: 'View a summary of your top holdings. See all on the Portfolio page.',
    highlight: 'holdings-summary-tutorial',
    textPosition: 'top-center',
  },
  {
    id: 3,
    title: '',
    description: 'Set up automatic investments to build your portfolio over time without having to manually trade.',
    highlight: 'auto-invest-tutorial',
    textPosition: 'over-sibling',
    textOverElementId: 'ai-prediction-tutorial',
  },
  {
    id: 4,
    title: '',
    description: 'Stay informed with the latest financial news and market headlines.',
    highlight: 'headlines-tutorial',
    textPosition: 'top-center',
  },
  {
    id: 5,
    title: '',
    description: 'Learn investing concepts through curated educational content tailored to your experience level.',
    highlight: 'educational-content-tutorial',
    textPosition: 'over-sibling',
    textOverElementId: 'bundles-tutorial',
  },
  {
    id: 6,
    title: '',
    description: 'Explore investment bundles — pre-made collections of stocks to help you diversify easily.',
    highlight: 'bundles-tutorial',
    textPosition: 'over-sibling',
    textOverElementId: 'educational-content-tutorial',
  },
  // Phase 2: Bottom Nav Tutorial
  {
    id: 7,
    title: '',
    description: 'This is your navigation bar. Tap any icon to switch pages.',
    highlight: 'bottom-nav-tutorial',
    textPosition: 'above-bottom-nav-center',
  },
  {
    id: 8,
    title: '',
    description: 'Long press on the Explore tab to pick it up.',
    highlight: 'bottom-nav-explore-tutorial',
    textPosition: 'above-bottom-nav-left',
    stepType: 'interactive-drag-start',
  },
  {
    id: 9,
    title: '',
    description: 'Now drag it to another page and release.',
    highlight: 'bottom-nav-tutorial',
    textPosition: 'above-bottom-nav-center',
    stepType: 'interactive-drag-end',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [textTooltipPosition, setTextTooltipPosition] = useState<TooltipPosition | null>(null);
  const [showBlur, setShowBlur] = useState(false);
  const [animateSwipe, setAnimateSwipe] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';
  const isDarkClear = isClearMode && theme === 'dark';

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
    });

    if (currentStep.highlight === 'intro-step') {
      const introPosition = {
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        width: 400,
        height: 300,
      };
      setTooltipPosition(introPosition);
      setTextTooltipPosition(introPosition);
      setShowBlur(true);
      return;
    }

    // --- POLLING LOGIC ---
    // This function will try to find the element, and if it fails,
    // it will try again every 50ms, up to 40 times (2 seconds).
    const findElement = (retriesLeft: number) => {
      const element = document.getElementById(currentStep.highlight);

      if (element) {
        // --- Found it! ---
        const rect = element.getBoundingClientRect();

        // First scroll the element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight-active');

        // Add themed glow for interactive steps
        if (currentStep.stepType === 'interactive-drag-start') {
          element.classList.add(theme === 'dark' ? 'tutorial-highlight-glow-dark' : 'tutorial-highlight-glow-light');
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
            // Position text at top center of viewport
            textPos = {
              top: 100,
              left: window.innerWidth / 2 - 200,
              width: 400,
              height: 250,
            };
          } else if (currentStep.textPosition === 'top-of-element') {
            // Position text at top center of the highlighted element
            textPos = {
              top: finalRect.top + 20,
              left: finalRect.left,
              width: finalRect.width,
              height: 250,
            };
          } else if (currentStep.textPosition === 'over-sibling' && currentStep.textOverElementId) {
            // Position text over a sibling element
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
              // Fallback to over-element if sibling not found
              textPos = highlightPos;
            }
          } else if (currentStep.textPosition === 'above-bottom-nav-center') {
            // Position text just above the bottom nav, centered
            textPos = {
              top: window.innerHeight - 180,
              left: window.innerWidth / 2 - 200,
              width: 400,
              height: 100,
            };
          } else if (currentStep.textPosition === 'above-bottom-nav-left') {
            // Position text just above the bottom nav, aligned left
            textPos = {
              top: window.innerHeight - 180,
              left: 20,
              width: 350,
              height: 100,
            };
          } else {
            // Default: over-element - text appears over the highlighted element
            textPos = highlightPos;
          }

          setTextTooltipPosition(textPos);
          setShowBlur(true);
          // Trigger swipe animation after positions are set
          setTimeout(() => setAnimateSwipe(true), 100);
        }, 400); // Wait for scroll animation to complete
      } else if (retriesLeft > 0) {
        // --- Not found, try again ---
        setTimeout(() => findElement(retriesLeft - 1), 50);
      } else {
        // --- Out of retries, give up ---
        console.error(`TUTORIAL ERROR: Element not found after multiple retries: ${currentStep.highlight}`);
        onComplete(); // End tutorial if an element can't be found
      }
    };

    // Start polling, giving it 40 retries (2 seconds total)
    findElement(40);
    // --- END OF LOGIC ---

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

    // For interactive steps, listen for events from bottom-nav
    if (stepType === 'interactive-drag-start') {
      const handleDragStart = () => handleNext();
      window.addEventListener('bottomNavDragStart', handleDragStart);
      return () => window.removeEventListener('bottomNavDragStart', handleDragStart);
    }

    if (stepType === 'interactive-drag-end') {
      const handleDragEnd = () => handleNext();
      window.addEventListener('bottomNavDragEnd', handleDragEnd);
      return () => window.removeEventListener('bottomNavDragEnd', handleDragEnd);
    }

    // For auto steps (default), use the 7-second timer
    const timer = setTimeout(() => {
      handleNext();
    }, 7000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  const handleNext = () => {
    if (isExiting) return; // Prevent double-clicks during exit

    // Start exit animation
    setIsExiting(true);
    setAnimateSwipe(false);

    // Wait for exit animation to complete, then transition
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
    }, 600); // Wait for exit swipe animation
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

  const isIntroStep = step.highlight === 'intro-step';
  const isBottomNavStep = step.highlight.includes('bottom-nav');
  const descriptionLines = splitTextIntoLines(step.description, 70);

  return (
    <>
      {showBlur && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
          style={{
            backdropFilter: 'blur(8px)',
            // For bottom nav steps, don't cover the bottom 80px where the nav bar is
            height: isBottomNavStep ? 'calc(100% - 80px)' : '100%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={isIntroStep ? undefined : handleSkip}
        />
      )}
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
        className="flex justify-center items-start z-[120] pointer-events-auto overflow-visible"
      >
        <div className="text-center text-white p-6 w-full">
          {isIntroStep ? (
            <>
              <div
                className={cn(
                  "flex justify-center mb-4",
                  isClearMode
                    ? isLightClear
                      ? "text-black/60"
                      : "text-white/80"
                    : "text-primary"
                )}
              >
                <AppleHelloEnglishEffect speed={1.1} />
              </div>
              <h3 className="font-bold text-2xl drop-shadow-md">{step.title}</h3>
              <p className="text-lg mt-1 drop-shadow-md">{step.description}</p>
            </>
          ) : (
            <>
              {/* Title with Swipe Reveal */}
              {step.title && (
                <div className="flex justify-center mb-2">
                  <div className="relative overflow-hidden w-fit inline-block rounded-full">
                    <motion.h3
                      className="font-bold text-3xl drop-shadow-md px-2 py-1"
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
                  <div key={index} className="flex justify-center">
                    <div className="relative overflow-hidden w-fit inline-block rounded-full">
                      <motion.p
                        className="text-lg drop-shadow-md px-2 py-1 whitespace-nowrap"
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

              {/* Buttons with fade reveal */}
              <div className="mt-6">
                <motion.div
                  className="flex justify-between items-center"
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
                  <Button variant="ghost" size="lg" onClick={handleSkip} className="text-white hover:text-white hover:bg-white/10">
                    <X className="mr-2 h-5 w-5" /> Skip
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleNext} className="text-white hover:text-white hover:bg-white/10">
                    {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
