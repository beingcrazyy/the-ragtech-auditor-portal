
import React from 'react';

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200/70 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Shimmer className="h-6 w-32" />
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-2/3" />
    </div>
  </div>
);

export const SkeletonRow = () => (
    <div className="flex items-center space-x-4 py-4 px-6 border-b border-slate-50 last:border-0">
        <Shimmer className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-48" />
            <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-6 w-20 rounded-full" />
    </div>
);

export const SkeletonDetail = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="space-y-3">
                <Shimmer className="h-8 w-64" />
                <Shimmer className="h-4 w-32" />
            </div>
            <Shimmer className="h-10 w-24 rounded-xl" />
        </div>

        {/* Sections */}
        <div className="grid gap-6">
            <div className="p-8 border border-slate-100 rounded-[32px] bg-white">
                <Shimmer className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                    <Shimmer className="h-16 w-full rounded-2xl" />
                    <Shimmer className="h-16 w-full rounded-2xl" />
                    <Shimmer className="h-16 w-full rounded-2xl" />
                </div>
            </div>
             <div className="p-8 border border-slate-100 rounded-[32px] bg-white">
                <Shimmer className="h-6 w-48 mb-6" />
                <Shimmer className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);
