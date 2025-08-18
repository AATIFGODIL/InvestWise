
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import PageSkeleton from '@/components/layout/page-skeleton';

const TradePageContent = dynamic(() => import('@/components/trade/trade-client'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});


export default function TradePage() {
    return (
        <AppLayout>
            <Suspense>
                <TradePageContent />
            </Suspense>
        </AppLayout>
    )
}
