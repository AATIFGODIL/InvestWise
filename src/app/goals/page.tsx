
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';

const GoalsClient = dynamic(() => import('@/components/goals/goals-client'), {
  loading: () => <PageSkeleton />,
});

export default function GoalsPage() {
  return (
    <AppLayout>
      <GoalsClient />
    </AppLayout>
  );
}
