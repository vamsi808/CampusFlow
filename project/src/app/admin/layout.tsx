
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
        router.replace('/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.replace('/'); // Redirect non-admins to homepage
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
        <div className="space-y-4 p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="text-center text-muted-foreground mt-8">
                <p>Loading admin dashboard...</p>
                <p>You must be an administrator to view this page.</p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
