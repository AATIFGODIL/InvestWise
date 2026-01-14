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
type TextPosition = 'over-element' | 'top-center' | 'over-sibling';

interface Step {
  id: number;
  title: string;
  description: string;
  highlight: string;
  textPosition: TextPosition;
  // Optional: ID of the element to position text over (for 'over-sibling')
  textOverElementId?: string;
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
    textPosition: 'over-element',
  },
  {
    id: 2,
    title: '',
    description: 'This area shows a summary of the top stocks you own. A full list is available on the Portfolio page.',
    highlight: 'holdings-summary-tutorial',
    textPosition: 'over-element',
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
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';


  // Function to calculate and set the highlight position
  const updateHighlight = useCallback(() => {
    const currentStep = steps[currentStepIndex];

    // Clear any previous highlight
    document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
      el.classList.remove('tutorial-highlight-active');
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
              height: 100,
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
          } else {
            // Default: over-element - text appears over the highlighted element
            textPos = highlightPos;
          }

          setTextTooltipPosition(textPos);
          setShowBlur(true);
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

  // Auto-advance timer for all steps (7 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
    }, 7000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  const handleNext = () => {
    setShowBlur(false);
    setTooltipPosition(null);
    setTextTooltipPosition(null);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    setShowBlur(false);
    setTooltipPosition(null);
    setTextTooltipPosition(null);
    onComplete();
  };

  const step = steps[currentStepIndex];
  if (!step || !tooltipPosition || !textTooltipPosition) return null;

  const isIntroStep = step.highlight === 'intro-step';

  return (
    <>
      {showBlur && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
          style={{ backdropFilter: 'blur(8px)' }}
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
        className="flex justify-center items-center z-[120] pointer-events-auto"
      >
        <div className="text-center text-white p-4 max-w-sm">
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
              {step.title && <h3 className="font-bold text-xl drop-shadow-md">{step.title}</h3>}
              <p className="text-sm mt-1 drop-shadow-md">{step.description}</p>
              <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-white hover:text-white hover:bg-white/10">
                  <X className="mr-2 h-4 w-4" /> Skip
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNext} className="text-white hover:text-white hover:bg-white/10">
                  {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
