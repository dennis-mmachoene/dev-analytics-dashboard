// components/charts/CommitsLineChart.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CommitData } from '@/types/github';

interface CommitsLineChartProps {
  data: CommitData[];
  className?: string;
}

export default function CommitsLineChart({ data, className = '' }: CommitsLineChartProps) {
  // Filter to show every nth label to avoid crowding
  const tickCount = Math.min(10, data.length);
  const step = Math.ceil(data.length / tickCount);
  const ticks = data
    .filter((_, index) => index % step === 0)
    .map((d) => d.date);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-slate-200 dark:stroke-slate-700" 
          />
          <XAxis
            dataKey="date"
            ticks={ticks}
            className="text-xs text-slate-600 dark:text-slate-400"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs text-slate-600 dark:text-slate-400"
            stroke="currentColor"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#commitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}