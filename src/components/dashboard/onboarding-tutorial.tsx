
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';
import { AppleHelloEnglishEffect } from '../ui/apple-hello-effect';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Welcome to InvestWise',
    description: 'Your financial world, now in one glassy home.',
    highlight: null,
    duration: 3000,
  },
  {
    id: 2,
    title: 'Your Portfolio Snapshot',
    description: 'Instantly track your total value and daily performance.',
    highlight: 'portfolio-card-tutorial',
    duration: 4000,
  },
  {
    id: 3,
    title: 'Watchlist & Favorites',
    description: 'Keep an eye on stocks you’re interested in. Long-press the search bar to customize your favorites.',
    highlight: 'watchlist-tutorial',
    duration: 5000,
  },
  {
    id: 4,
    title: 'Automate Your Growth',
    description: 'Set up recurring investments and let your money work for you.',
    highlight: 'auto-invest-tutorial',
    duration: 4000,
  },
  {
    id: 5,
    title: 'Harness the Power of AI',
    description: 'Get AI-powered predictions to inform your next move.',
    highlight: 'ai-prediction-tutorial',
    duration: 4000,
  },
  {
    id: 6,
    title: 'Discover Investment Bundles',
    description: 'Easily diversify with curated collections of stocks.',
    highlight: 'bundles-tutorial',
    duration: 4000,
  },
  {
    id: 7,
    title: 'Learn from the Community',
    description: 'See what others are investing in and climb the leaderboard.',
    highlight: 'community-leaderboard-tutorial',
    duration: 4000,
  },
   {
    id: 8,
    title: "You're All Set!",
    description: 'Start exploring and build your financial future.',
    highlight: null,
    duration: 3000,
  },
];

const GlassOverlay = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { isClearMode, theme } = useThemeStore();
    const isLightClear = isClearMode && theme === 'light';

    return (
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className={cn(
                "p-6 rounded-2xl shadow-2xl shadow-black/20 text-center",
                isClearMode
                    ? isLightClear
                        ? "bg-card/60 ring-1 ring-white/10 text-black"
                        : "bg-white/10 ring-1 ring-white/60 text-white"
                    : "bg-card text-card-foreground",
                className
            )}
            style={{ backdropFilter: 'blur(16px)' }}
        >
            {children}
        </motion.div>
    );
};

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.highlight) {
      const element = document.getElementById(step.highlight);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightedRect(rect);
        // Scroll to the element to make sure it's in view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedRect(null);
    }

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);


  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
      />

       <AnimatePresence>
        {highlightedRect && (
          <motion.div
            key={`highlight-${step.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1,
                top: highlightedRect.top - 16,
                left: highlightedRect.left - 16,
                width: highlightedRect.width + 32,
                height: highlightedRect.height + 32,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute rounded-3xl ring-4 ring-primary bg-primary/20 pointer-events-none"
            style={{ backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>
      
       <div className="relative z-20 flex flex-col items-center">
         <AnimatePresence mode="wait">
            <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
            >
                <GlassOverlay>
                    {step.id === 1 && (
                         <div className="text-primary">
                             <AppleHelloEnglishEffect />
                         </div>
                    )}
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                    <p className="mt-2 max-w-sm">{step.description}</p>
                     {step.id === steps.length && (
                         <Button onClick={onComplete} className="mt-4">Start Exploring →</Button>
                    )}
                </GlassOverlay>
            </motion.div>
         </AnimatePresence>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4">
            <Button variant="ghost" onClick={onComplete} className="text-white hover:bg-white/20 hover:text-white">
                <X className="mr-2 h-4 w-4"/> Skip Tutorial
            </Button>
        </div>
      </div>
    </div>
  );
}
