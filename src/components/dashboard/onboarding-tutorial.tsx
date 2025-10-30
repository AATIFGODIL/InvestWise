'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  highlight: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Your Portfolio Snapshot',
    description: 'This is your main portfolio overview. Track your total value and how your investments are performing over time.',
    highlight: 'portfolio-card-tutorial',
  },
  {
    id: 2,
    title: 'My Top Holdings',
    description: 'This area shows a summary of the top stocks you own. A full list is available on the Portfolio page.',
    highlight: 'holdings-summary-tutorial',
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
  const [showBlur, setShowBlur] = useState(false);

  // Function to calculate and set the highlight position
  const updateHighlight = useCallback(() => {
    const currentStep = steps[currentStepIndex];

    // Clear any previous highlight
    document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
      el.classList.remove('tutorial-highlight-active');
    });

    // --- NEW POLLING LOGIC ---
    // This function will try to find the element, and if it fails,
    // it will try again every 100ms, up to 20 times (2 seconds).
    const findElement = (retriesLeft: number) => {
      const element = document.getElementById(currentStep.highlight);

      if (element) {
        // --- Found it! ---
        const rect = element.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight-active');
        setShowBlur(true);
      } else if (retriesLeft > 0) {
        // --- Not found, try again ---
        console.log(`Tutorial element not found, retrying... ${retriesLeft} retries left.`);
        setTimeout(() => findElement(retriesLeft - 1), 100);
      } else {
        // --- Out of retries, give up ---
        console.error(`TUTORIAL ERROR: Element not found after 20 retries: ${currentStep.highlight}`);
        // We could optionally skip the step or end the tutorial here
        // onComplete();
      }
    };

    // Start polling, giving it 20 retries
    findElement(20);
    // --- END OF NEW LOGIC ---

  }, [currentStepIndex, onComplete]);

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

  const handleNext = () => {
    setShowBlur(false);
    setTooltipPosition(null); // <-- This ensures a smooth transition
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    setShowBlur(false);
    setTooltipPosition(null); // <-- This ensures a smooth transition
    onComplete();
  };

  const step = steps[currentStepIndex];
  if (!step || !tooltipPosition) return null;

  // Position the text box at the top of the highlighted element
  const textTopPosition = tooltipPosition.top;

  return (
    <>
        {showBlur && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
            style={{ backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
          />
        )}
        <motion.div 
          key={`tooltip-${step.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
              position: 'fixed',
              top: `${textTopPosition}px`,
              left: `${tooltipPosition.left}px`,
              width: `${tooltipPosition.width}px`,
          }}
          className="flex justify-center items-center z-[120] pointer-events-auto"
        >
         <div className="text-center text-white p-4 max-w-sm">
           <h3 className="font-bold text-xl drop-shadow-md">{step.title}</h3>
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
         </div>
       </motion.div>
    </>
  );
}
