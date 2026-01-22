
import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, FolderOpen } from 'lucide-react';
import { Button } from './Shared';

interface AsyncViewProps<T> {
  data?: T | null;
  loading: boolean;
  error?: Error | null;
  /**
   * Defines what is considered "empty". 
   * If array: empty if length 0. 
   * If object: empty if null/undefined.
   */
  isEmpty?: boolean; 
  children: ReactNode;
  
  // UI Variants
  loadingSkeleton: ReactNode;
  errorTitle?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export const AsyncView = <T,>({
  loading,
  error,
  isEmpty,
  children,
  loadingSkeleton,
  onRetry,
  errorTitle = "Unable to load data",
  emptyTitle = "No data found",
  emptyMessage = "There is nothing here yet.",
  className = ""
}: AsyncViewProps<T>) => {

  if (loading) {
    return <div className={`w-full ${className}`}>{loadingSkeleton}</div>;
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center rounded-[32px] bg-red-50/50 border border-red-100 ${className}`}>
        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{errorTitle}</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">{error.message}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} className="bg-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center rounded-[32px] bg-slate-50/50 border border-slate-100 ${className}`}>
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{emptyTitle}</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};
