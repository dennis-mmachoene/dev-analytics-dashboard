// components/StatsCards.tsx

import { Star, GitFork, Github, Activity, LucideIcon } from 'lucide-react';
import GlassCard from './ui/GlassCard';

interface StatCardData {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

interface StatsCardsProps {
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalCommits: number;
}

export default function StatsCards({
  totalStars,
  totalForks,
  totalRepos,
  totalCommits,
}: StatsCardsProps) {
  const stats: StatCardData[] = [
    {
      icon: Star,
      label: 'Total Stars',
      value: totalStars,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: GitFork,
      label: 'Total Forks',
      value: totalForks,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Github,
      label: 'Repositories',
      value: totalRepos,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Activity,
      label: 'Commits',
      value: totalCommits,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <GlassCard key={index} hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {stat.label}
              </p>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                {stat.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}