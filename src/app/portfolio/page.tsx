
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';

const PortfolioClient = dynamic(() => import('@/components/portfolio/portfolio-client'), {
  loading: () => <PageSkeleton />,
});

export default function PortfolioPage() {
  return (
    <AppLayout>
      <PortfolioClient />
    </AppLayout>
  );
}
