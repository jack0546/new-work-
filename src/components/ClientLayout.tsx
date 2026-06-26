"use client";

import ErrorBoundary from '@/components/ErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { Toaster } from '@/components/ui/toaster';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PerformanceMonitor />
      {children}
      <Toaster />
    </ErrorBoundary>
  );
}
