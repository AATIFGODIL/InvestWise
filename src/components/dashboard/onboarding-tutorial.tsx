
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const steps = [
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

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

  const updateHighlight = useCallback(() => {
    const step = steps[currentStepIndex];
    if (step && step.highlight) {
      const element = document.getElementById(step.highlight);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a delay to allow for scrolling before getting the rect
        setTimeout(() => {
          setHighlightedRect(element.getBoundingClientRect());
        }, 300);
      }
    } else {
      setHighlightedRect(null);
    }
  }, [currentStepIndex]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [updateHighlight]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStepIndex];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onComplete}
      />

       <AnimatePresence>
        {highlightedRect && (
          <motion.div
            key={`highlight-${step.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
                opacity: 1,
                scale: 1,
                top: highlightedRect.top - 16,
                left: highlightedRect.left - 16,
                width: highlightedRect.width + 32,
                height: highlightedRect.height + 32,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute rounded-3xl bg-transparent pointer-events-none border-2 border-white/80 shadow-2xl shadow-white/20"
          />
        )}
      </AnimatePresence>
      
       <motion.div 
         key={`tooltip-${step.id}`}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20"
       >
        <div className="bg-transparent p-4 rounded-xl text-center text-white">
          <h3 className="font-bold text-xl drop-shadow-md">{step.title}</h3>
          <p className="text-sm mt-1 drop-shadow-md">{step.description}</p>
          <div className="flex justify-between items-center mt-4">
             <Button variant="ghost" size="sm" onClick={onComplete} className="text-white hover:text-white hover:bg-white/10">
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
