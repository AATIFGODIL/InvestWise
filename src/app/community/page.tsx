
import CommunityClient from '@/components/community/community-client';
import { Suspense } from 'react';

export default function CommunityPage() {
  return (
    <Suspense>
      <CommunityClient />
    </Suspense>
  );
}
