
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import PageSkeleton from '@/components/layout/page-skeleton';

const PortfolioClient = dynamic(() => import('@/components/portfolio/portfolio-client'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

export default function PortfolioPage() {
  return (
    <AppLayout>
      <Suspense>
        <PortfolioClient />
      </Suspense>
    </AppLayout>
  );
}
