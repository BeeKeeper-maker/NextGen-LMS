'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    }>
      <AppLayout />
    </Suspense>
  );
}
