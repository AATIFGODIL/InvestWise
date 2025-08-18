
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';

const DashboardClient = dynamic(() => import('@/components/dashboard/dashboard-client'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardClient />
    </AppLayout>
  );
}
