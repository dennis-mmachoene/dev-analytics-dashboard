// components/ui/GlassCard.tsx

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-md 
        bg-white/80 dark:bg-slate-800/50 
        border border-slate-200 dark:border-slate-700/50 
        rounded-2xl 
        p-6 
        shadow-xl 
        ${hover ? 'transition-all hover:shadow-2xl hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}