
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import PageSkeleton from '@/components/layout/page-skeleton';

const CommunityClient = dynamic(() => import('@/components/community/community-client'), {
  ssr: false,
  loading: () => <PageSkeleton />,
});


export default function CommunityPage() {
  return (
    <AppLayout>
      <Suspense>
        <CommunityClient />
      </Suspense>
    </AppLayout>
  );
}
