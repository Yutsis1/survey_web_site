'use client';
import { useAuth } from './contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if not authenticated, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.push('/auth');
    }
    if (isAuthenticated) {
      router.push('/survey-builder');
    }
  }, [isAuthenticated, isLoading, router]);

  // treat loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-4xl font-bold">Survey Web Site</h1>
        <p className="mt-4">Welcome to the survey application</p>
      </div>
    </main>
  );
}