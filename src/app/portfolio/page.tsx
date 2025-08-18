
import PortfolioClient from '@/components/portfolio/portfolio-client';
import AppLayout from '@/components/layout/app-layout';
import { Suspense } from 'react';

export default function PortfolioPage() {
  return (
    <AppLayout>
      <Suspense>
        <PortfolioClient />
      </Suspense>
    </AppLayout>
  );
}
