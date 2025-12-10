'use client';

import HoldingsTable from '@/components/portfolio/holdings-table';
import { Clock, PlusCircle } from 'lucide-react';
import Chatbot from '@/components/chatbot/chatbot';
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
      <motion.div
        className="p-4 space-y-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <Button onClick={handleAddFunds} className={cn('ring-1 ring-white/60')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add $100 (Demo)
          </Button>
        </motion.div>
        <motion.div variants={itemVariants}>
          <PortfolioValue />
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Holdings</h2>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Clock className="h-4 w-4" />
              <span>Market is {isMarketOpen ? 'open' : 'closed'}.</span>
            </div>
          </div>
          <HoldingsTable />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Watchlist />
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AutoInvest />
          <AiPrediction />
        </motion.div>
        <Chatbot />
      </motion.div>
    </main>
  );
}
