// components/Loading.tsx

import GlassCard from './ui/GlassCard';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i}>
            <div className="animate-pulse">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Chart Skeleton */}
      <GlassCard>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </GlassCard>

      {/* Message */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">
          <div className="w-5 h-5 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}