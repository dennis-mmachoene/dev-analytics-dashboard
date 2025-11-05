// components/charts/LanguagesDonut.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LanguageData } from '@/types/github';

interface LanguagesDonutProps {
  data: LanguageData[];
  showLegend?: boolean;
  className?: string;
}

/**
 * ChartDatum has an index signature so it's compatible with Recharts' ChartDataInput.
 * We still keep explicit fields we use (name, bytes, repos, percentage, color).
 */
type ChartDatum = {
  [key: string]: any; // <-- makes it compatible with ChartDataInput
  name: string;
  bytes: number;
  repos?: number;
  percentage?: number;
  color?: string;
};

export default function LanguagesDonut({
  data,
  showLegend = false,
  className = '',
}: LanguagesDonutProps) {
  // Take top 8 languages and group the rest as "Other"
  const topLanguages = data.slice(0, 8);
  const otherLanguages = data.slice(8);

  // Map to ChartDatum[] so the shape is explicit and safe for Recharts
  const chartData: ChartDatum[] = topLanguages.map((lang) => ({
    name: lang.name,
    bytes: lang.bytes,
    repos: lang.repos,
    percentage: lang.percentage, // if your LanguageData already has it
    color: lang.color,
  }));

  if (otherLanguages.length > 0) {
    const otherBytes = otherLanguages.reduce((sum, lang) => sum + lang.bytes, 0);
    const otherRepos = otherLanguages.reduce((sum, lang) => sum + (lang.repos || 0), 0);
    const totalBytes = data.reduce((sum, lang) => sum + lang.bytes, 0) || 1;

    chartData.push({
      name: 'Other',
      bytes: otherBytes,
      repos: otherRepos,
      percentage: (otherBytes / totalBytes) * 100,
      color: '#64748b',
    });
  }

  // Keep the tooltip typing loose to avoid TS friction with Recharts payload typings
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d: ChartDatum = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{d.name}</p>
          <p className="text-slate-300 text-sm">
            {(d.bytes / 1000).toFixed(0)}K bytes
          </p>
          <p className="text-slate-300 text-sm">{d.repos ?? 0} repositories</p>
          <p className="text-purple-400 text-sm font-semibold">
            {(d.percentage ?? 0).toFixed(1)}%
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
            label={({ name, percentage }: any) =>
              `${name} ${((percentage ?? 0)).toFixed(0)}%`
            }
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
