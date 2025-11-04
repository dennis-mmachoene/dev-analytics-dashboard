// app/profile/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Lightbulb } from 'lucide-react';
import StatsCards from '@/components/StatsCards';
import LanguagesDonut from '@/components/charts/LanguagesDonut';
import CommitsLineChart from '@/components/charts/CommitsLineChart';
import GlassCard from '@/components/ui/GlassCard';
import Loading from '@/components/Loading';

export default function OverviewPage({ params }: { params: { username: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/github?username=${params.username}&type=analytics&days=90`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analytics');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [params.username]);

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  if (error || !data) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error || 'Failed to load analytics'}
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards
        totalStars={data.stats.totalStars}
        totalForks={data.stats.totalForks}
        totalRepos={data.stats.totalRepos}
        totalCommits={data.stats.totalCommits}
      />

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Key Insights
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.insights.map((insight: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Languages & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        {data.languages && data.languages.length > 0 && (
          <GlassCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Languages
            </h3>
            <LanguagesDonut data={data.languages.slice(0, 8)} />
            <div className="mt-6 space-y-2">
              {data.languages.slice(0, 5).map((lang: any) => (
                <div key={lang.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">
                      {lang.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      {lang.repos} repos
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Activity */}
        {data.commits && data.commits.timeseries && (
          <GlassCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Commit Activity (90 days)
            </h3>
            <CommitsLineChart data={data.commits.timeseries} />
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total commits:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {data.commits.total.toLocaleString()}
                </span>
              </p>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Top Repositories */}
      {data.repos && data.repos.length > 0 && (
        <GlassCard>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Top Repositories
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.repos.slice(0, 6).map((repo: any) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-100 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
              >
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
                  {repo.name}
                </h4>
                {repo.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                </div>
              </a>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}