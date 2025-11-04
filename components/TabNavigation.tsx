// components/TabNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Code2, Activity, FolderGit2 } from 'lucide-react';

interface TabNavigationProps {
  username: string;
}

export default function TabNavigation({ username }: TabNavigationProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Overview',
      href: `/profile/${username}`,
      icon: LayoutDashboard,
    },
    {
      name: 'Languages',
      href: `/profile/${username}/languages`,
      icon: Code2,
    },
    {
      name: 'Activity',
      href: `/profile/${username}/activity`,
      icon: Activity,
    },
    {
      name: 'Repositories',
      href: `/profile/${username}/repositories`,
      icon: FolderGit2,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/profile/${username}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap
              ${
                active
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }
            `}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}