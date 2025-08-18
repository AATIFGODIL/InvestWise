
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';

const TradePageContent = dynamic(() => import('@/components/trade/trade-client'), {
  loading: () => <PageSkeleton />,
});


export default function TradePage() {
    return (
        <AppLayout>
            <TradePageContent />
        </AppLayout>
    )
}
