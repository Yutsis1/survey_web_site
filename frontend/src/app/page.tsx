'use client';
import { useAuth } from './contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete
    
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Always show loading during initial check or redirect
  return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">Loading...</div>
      </main>
  );
}
