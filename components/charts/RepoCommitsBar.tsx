// components/charts/RepoCommitsBar.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RepoCommitData } from '@/types/github';

interface RepoCommitsBarProps {
  data: RepoCommitData[];
  className?: string;
}

export default function RepoCommitsBar({ data, className = '' }: RepoCommitsBarProps) {
  // Gradient colors for bars
  const colors = [
    '#8b5cf6',
    '#7c3aed',
    '#6d28d9',
    '#5b21b6',
    '#4c1d95',
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-purple-400 text-sm font-semibold">
            {data.commits} commits
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-slate-200 dark:stroke-slate-700"
          />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-xs text-slate-600 dark:text-slate-400"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs text-slate-600 dark:text-slate-400"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="commits" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}