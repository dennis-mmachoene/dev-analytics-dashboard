// components/charts/LanguagesDonut.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LanguageData } from '@/types/github';

interface LanguagesDonutProps {
  data: LanguageData[];
  showLegend?: boolean;
  className?: string;
}

export default function LanguagesDonut({
  data,
  showLegend = false,
  className = '',
}: LanguagesDonutProps) {
  // Take top 8 languages and group the rest as "Other"
  const topLanguages = data.slice(0, 8);
  const otherLanguages = data.slice(8);
  
  const chartData = [...topLanguages];
  
  if (otherLanguages.length > 0) {
    const otherBytes = otherLanguages.reduce((sum, lang) => sum + lang.bytes, 0);
    const otherRepos = otherLanguages.reduce((sum, lang) => sum + lang.repos, 0);
    const totalBytes = data.reduce((sum, lang) => sum + lang.bytes, 0);
    
    chartData.push({
      name: 'Other',
      bytes: otherBytes,
      repos: otherRepos,
      percentage: (otherBytes / totalBytes) * 100,
      color: '#64748b',
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-slate-300 text-sm">
            {(data.bytes / 1000).toFixed(0)}K bytes
          </p>
          <p className="text-slate-300 text-sm">{data.repos} repositories</p>
          <p className="text-purple-400 text-sm font-semibold">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="bytes"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}