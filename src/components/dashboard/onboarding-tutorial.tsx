
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
    title: 'Your Holdings & Watchlist',
    description: 'Here you can see a summary of your top holdings and track stocks you are interested in.',
    highlight: 'holdings-watchlist-tutorial',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [showBlur, setShowBlur] = useState(false);

  const updateHighlight = useCallback(() => {
    // Remove class from all highlightable elements first
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
            top: rect.top - 8, 
            left: rect.left,
            width: rect.width,
        });

        // Delay the animation start to allow for scroll
        setTimeout(() => {
            element?.classList.add('tutorial-highlight-active');
            setShowBlur(true); // Fade in the blur after the animation starts
        }, 300);
      }
    }
  }, [currentStepIndex]);


  useEffect(() => {
    updateHighlight();

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.querySelectorAll('.tutorial-highlight-active').forEach(el => {
        el.classList.remove('tutorial-highlight-active');
      });
    };
  }, [updateHighlight]);


  const handleNext = () => {
    setShowBlur(false); // Fade out the blur on next
    document.getElementById(steps[currentStepIndex].highlight)?.classList.remove('tutorial-highlight-active');

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    setShowBlur(false);
    document.getElementById(steps[currentStepIndex].highlight)?.classList.remove('tutorial-highlight-active');
    onComplete();
  };

  const step = steps[currentStepIndex];
  if (!step || !tooltipPosition) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showBlur ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
       <motion.div 
         key={`tooltip-${step.id}`}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0 }}
         style={{
             position: 'absolute',
             top: `${tooltipPosition.top}px`,
             left: `${tooltipPosition.left}px`,
             width: `${tooltipPosition.width}px`,
             transform: 'translateY(-100%)', // Position above the element
         }}
         className="w-full max-w-sm px-4 z-[120]"
       >
        <div className="text-center text-white p-4">
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
    </div>
  );
}
