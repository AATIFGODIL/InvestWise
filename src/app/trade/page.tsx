
"use client";

import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';
import AutoTradeApprovalDialog from '@/components/trade/auto-trade-approval-dialog';

const TradeClient = dynamic(() => import('@/components/trade/trade-client'), {
  loading: () => <PageSkeleton />,
  ssr: false, // Disable SSR for this component to avoid window-related errors
});


export default function TradePage() {
    return (
        <AppLayout>
            <TradeClient />
            <AutoTradeApprovalDialog />
        </AppLayout>
    )
}
