// app/profile/[username]/repositories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Star, GitFork, Eye, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Loading from '@/components/Loading';
import { GitHubRepo } from '@/types/github';

export default function RepositoriesPage({ params }: { params: { username: string } }) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated'>('stars');

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/github?username=${params.username}&type=repos`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch repositories');
        }

        const result = await response.json();
        setRepos(result.data);
      } catch (err: any) {
        console.error('Error fetching repos:', err);
        setError(err.message || 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [params.username]);

  if (loading) {
    return <Loading message="Loading repositories..." />;
  }

  if (error || !repos) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error || 'Failed to load repositories'}
          </p>
        </div>
      </GlassCard>
    );
  }

  const sortedRepos = [...repos].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'forks':
        return b.forks_count - a.forks_count;
      case 'updated':
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      default:
        return 0;
    }
  });

  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Total Repositories
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {repos.length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Total Stars
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalStars.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            Total Forks
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalForks.toLocaleString()}
          </p>
        </GlassCard>
      </div>

      {/* Repository List */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            All Repositories
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {sortedRepos.map((repo) => {
            const updatedDate = new Date(repo.pushed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={repo.id}
                className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-2 group"
                    >
                      <span className="truncate">{repo.name}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                    {repo.description && (
                      <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.fork && (
                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded text-xs font-medium flex-shrink-0">
                      Fork
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitFork className="w-4 h-4 text-blue-500" />
                    {repo.forks_count.toLocaleString()}
                  </span>
                  {repo.watchers_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-green-500" />
                      {repo.watchers_count.toLocaleString()}
                    </span>
                  )}
                  <span className="ml-auto">Updated {updatedDate}</span>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {repo.topics.slice(0, 5).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 5 && (
                      <span className="px-2 py-1 text-slate-500 dark:text-slate-400 rounded text-xs">
                        +{repo.topics.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}