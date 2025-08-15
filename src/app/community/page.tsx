
import CommunityClient from '@/components/community/community-client';
import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';

export default function CommunityPage() {
  return (
    <AppLayout>
      <Suspense>
        <CommunityClient />
      </Suspense>
    </AppLayout>
  );
}
