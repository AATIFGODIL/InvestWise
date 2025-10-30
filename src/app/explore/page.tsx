
"use client";

import ExploreClient from '@/components/dashboard/explore-client';
import AppLayout from '@/components/layout/app-layout';
import AutoTradeApprovalDialog from '@/components/trade/auto-trade-approval-dialog';

export default function ExplorePage() {
  return (
    <AppLayout>
      <ExploreClient />
      <AutoTradeApprovalDialog />
    </AppLayout>
  );
}
