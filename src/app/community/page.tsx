
import AppLayout from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/layout/page-skeleton';

const CommunityClient = dynamic(() => import('@/components/community/community-client'), {
  loading: () => <PageSkeleton />,
});


export default function CommunityPage() {
  return (
    <AppLayout>
      <CommunityClient />
    </AppLayout>
  );
}
