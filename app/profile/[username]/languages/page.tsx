// app/profile/[username]/languages/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import LanguagesDonut from '@/components/charts/LanguagesDonut';
import GlassCard from '@/components/ui/GlassCard';
import Loading from '@/components/Loading';
import { LanguageData } from '@/types/github';

export default function LanguagesPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLanguages() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/github?username=${resolvedParams.username}&type=languages`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch languages');
        }

        const result = await response.json();
        setLanguages(result.data.languages);
      } catch (err: any) {
        console.error('Error fetching languages:', err);
        setError(err.message || 'Failed to load languages');
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, [resolvedParams.username]);

  if (loading) {
    return <Loading message="Loading languages..." />;
  }

  if (error || !languages) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error || 'Failed to load languages'}
          </p>
        </div>
      </GlassCard>
    );
  }

  if (languages.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            No language data available
          </p>
        </div>
      </GlassCard>
    );
  }

  const totalBytes = languages.reduce((sum, lang) => sum + lang.bytes, 0);

  return (
    <div className="space-y-6">
      {/* Language Distribution Chart */}
      <GlassCard>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Language Distribution
        </h3>
        <div className="h-96">
          <LanguagesDonut data={languages} showLegend />
        </div>
      </GlassCard>

      {/* Language Table */}
      <GlassCard>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Language Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                  Language
                </th>
                <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                  Bytes
                </th>
                <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                  Repositories
                </th>
                <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang, index) => (
                <tr
                  key={lang.name}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {index + 1}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {lang.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                    {(lang.bytes / 1000).toFixed(1)}K
                  </td>
                  <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                    {lang.repos}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: lang.color,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white w-12 text-right">
                        {lang.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  Total
                </td>
                <td className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {(totalBytes / 1000000).toFixed(2)}M
                </td>
                <td className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {languages.reduce((sum, lang) => sum + lang.repos, 0)}
                </td>
                <td className="text-right py-3 px-4 font-bold text-slate-900 dark:text-white">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}