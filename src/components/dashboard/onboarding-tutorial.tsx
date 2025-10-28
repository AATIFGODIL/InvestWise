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
    description: 'Track your portfolio value and stock movements. Find more details on the Portfolio page.',
    highlight: 'portfolio-card-tutorial',
  },
  {
    id: 2,
    title: 'Your Top Holdings',
    description: 'This area shows a summary of the top stocks you own. A full list is on the Portfolio page.',
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

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const updateHighlight = useCallback(() => {
    document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
      el.classList.remove('tutorial-highlight-active');
    });

    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      const element = document.getElementById(currentStep.highlight);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const rect = element.getBoundingClientRect();
        setTooltipPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });

        setTimeout(() => {
            element?.classList.add('tutorial-highlight-active');
            setShowBlur(true);
        }, 300);
      }
    }
  }, [currentStepIndex]);


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


  const handleNext = () => {
    setShowBlur(false);
    const currentHighlightId = steps[currentStepIndex].highlight;
    const element = document.getElementById(currentHighlightId);
    if (element) {
      element.classList.remove('tutorial-highlight-active');
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    setShowBlur(false);
    const currentHighlightId = steps[currentStepIndex].highlight;
    const element = document.getElementById(currentHighlightId);
    if (element) {
      element.classList.remove('tutorial-highlight-active');
    }
    onComplete();
  };

  const step = steps[currentStepIndex];
  if (!step || !tooltipPosition) return null;

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
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: `${tooltipPosition.width}px`,
              height: `${tooltipPosition.height}px`,
          }}
          className="flex justify-center items-start z-[120] pointer-events-auto pt-8"
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
