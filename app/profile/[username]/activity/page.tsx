// app/profile/[username]/activity/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import CommitsLineChart from '@/components/charts/CommitsLineChart';
import RepoCommitsBar from '@/components/charts/RepoCommitsBar';
import GlassCard from '@/components/ui/GlassCard';
import Loading from '@/components/Loading';

export default function ActivityPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(90);

  useEffect(() => {
    async function fetchCommits() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/github?username=${resolvedParams.username}&type=commits&days=${timeRange}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch commits');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        console.error('Error fetching commits:', err);
        setError(err.message || 'Failed to load activity data');
      } finally {
        setLoading(false);
      }
    }

    fetchCommits();
  }, [resolvedParams.username, timeRange]);

  if (loading) {
    return <Loading message="Loading activity..." />;
  }

  if (error || !data) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error || 'Failed to load activity'}
          </p>
        </div>
      </GlassCard>
    );
  }

  const avgCommitsPerDay =
    data.timeseries && data.timeseries.length > 0
      ? (
          data.timeseries.reduce((sum: number, day: any) => sum + day.commits, 0) /
          data.timeseries.length
        ).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Total Commits
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {data.totalCommits.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Active Repositories
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {data.byRepo.length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Avg. Commits/Day
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {avgCommitsPerDay}
          </p>
        </GlassCard>
      </div>

      {/* Commit Timeline */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Commit Activity
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        {data.timeseries && data.timeseries.length > 0 ? (
          <CommitsLineChart data={data.timeseries} />
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No commit activity in this time period
          </div>
        )}
      </GlassCard>

      {/* Commits by Repository */}
      <GlassCard>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Commits by Repository
        </h3>
        {data.byRepo && data.byRepo.length > 0 ? (
          <>
            <RepoCommitsBar data={data.byRepo} />
            <div className="mt-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                Repository Details
              </h4>
              <div className="space-y-2">
                {data.byRepo.map((repo: any, index: number) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      >
                        {repo.name}
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {repo.commits} commits
                      </span>
                      <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                          style={{
                            width: `${(repo.commits / data.byRepo[0].commits) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No repository activity data available
          </div>
        )}
      </GlassCard>
    </div>
  );
}