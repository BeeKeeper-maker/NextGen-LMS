'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { AppLayout } from '@/components/layout/app-layout';

function HomeContent() {
  const router = useRouter();
  const { currentUser, setAppMode } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      const role = currentUser.role;
      if (role === 'super_admin') {
        router.replace('/super-admin');
      } else if (role === 'tenant_admin' || role === 'instructor' || role === 'content_creator') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } else {
      setAppMode('marketing');
    }
  }, [currentUser, router, setAppMode]);

  return <AppLayout />;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading NextGen LMS...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
