// InvestWise - A modern stock trading and investment education platform for young investors
'use client';

import { useState, useEffect } from 'react';
import HoldingsTable from '@/components/portfolio/holdings-table';
import { Clock, PlusCircle } from 'lucide-react';

import PortfolioValue from '@/components/portfolio/portfolio-value';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AiPrediction from '../ai/ai-prediction';
import AutoInvest from '@/components/dashboard/auto-invest';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useMarketStore } from '@/store/market-store';
import Watchlist from '../dashboard/watchlist';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTransactionStore } from '@/store/transaction-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateGoal from "@/components/goals/create-goal";
import GoalList from "@/components/goals/goal-list";
import { useGoalStore } from "@/store/goal-store";
import dynamic from 'next/dynamic';
import { Skeleton } from "../ui/skeleton";
import { ProModeToggle } from '@/components/shared/pro-mode-toggle';
import PortfolioTutorial from './portfolio-tutorial';

const YouTubePlayer = dynamic(() => import('../shared/youtube-player'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full aspect-video" />,
});

const videos = [
  {
    title: "Setting SMART Financial Goals",
    description: "Learn how to set Specific, Measurable, Achievable, Relevant, and Time-bound goals for your financial future.",
    youtubeUrl: "https://www.youtube.com/watch?v=UwTxtkGplUs",
  },
  {
    title: "The Psychology of Trading",
    description: "Understand the emotional and psychological aspects of trading to maintain discipline and make better decisions.",
    youtubeUrl: "https://www.youtube.com/watch?v=sauPy2JHzI0",
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export default function PortfolioClient() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { paymentMethodToken } = useUserStore();
  const { isMarketOpen } = useMarketStore();
  const { addTransaction } = useTransactionStore();
  const { goals, addGoal } = useGoalStore();
  const [showTutorial, setShowTutorial] = useState(false);

  // Check tutorial state when user is available (user-specific key)
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.uid) {
      const tutorialKey = `hasCompletedPortfolioTutorial_${user.uid}`;
      const hasCompletedTutorial = localStorage.getItem(tutorialKey);
      if (!hasCompletedTutorial) {
        setShowTutorial(true);
      }
    }
  }, [user?.uid]);

  const handleTutorialComplete = () => {
    if (typeof window !== 'undefined' && user?.uid) {
      const tutorialKey = `hasCompletedPortfolioTutorial_${user.uid}`;
      localStorage.setItem(tutorialKey, 'true');
    }
    setShowTutorial(false);
  };

  const handleAddFunds = async () => {
    if (!paymentMethodToken) {
      toast({
        variant: 'destructive',
        title: 'No Payment Method',
        description:
          'Please add a payment method in your profile before adding funds.',
      });
      router.push('/profile');
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to add funds.',
      });
      return;
    }

    try {
      // Simulate adding funds by creating a deposit transaction
      addTransaction({
        symbol: 'USD',
        action: 'buy', // 'buy' for deposit
        quantity: 100.0,
        price: 1,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: 'Funds Added!',
        description:
          '$100.00 has been added to your account. It may take a few moments to reflect in your balance.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Funds',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <main>
      {showTutorial && <PortfolioTutorial onComplete={handleTutorialComplete} />}
      <motion.div
        className="p-4 space-y-6 pb-40"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <Button onClick={handleAddFunds} className={cn('ring-1 ring-white/60')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add $100 (Demo)
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <motion.div variants={itemVariants} id="portfolio-value-tutorial">
              <PortfolioValue />
            </motion.div>
            <motion.div variants={itemVariants} id="holdings-section-tutorial">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Holdings</h2>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock className="h-4 w-4" />
                    <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
                  </div>
                  <ProModeToggle className="scale-90 origin-right" showLabel={true} />
                </div>
              </div>
              <HoldingsTable />
            </motion.div>
            <motion.div variants={itemVariants} id="watchlist-portfolio-tutorial">
              <Watchlist />
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="auto-invest-portfolio-tutorial">
                <AutoInvest />
              </div>
              <div id="ai-prediction-portfolio-tutorial">
                <AiPrediction />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <CreateGoal onAddGoal={addGoal} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <GoalList goals={goals} />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 pt-4">
              <h2 className="text-xl font-bold">Learn About Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {videos.map((video) => (
                  <YouTubePlayer key={video.title} videoTitle={video.title} description={video.description} youtubeUrl={video.youtubeUrl} />
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>


      </motion.div>
    </main>
  );
}
