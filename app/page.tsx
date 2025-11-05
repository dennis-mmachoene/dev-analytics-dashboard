// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Github, TrendingUp, BarChart3, Code2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      router.push(`/profile/${username.trim()}`);
    }
  };

  const handleExampleClick = (name: string) => {
    setUsername(name);
    setIsLoading(true);
    router.push(`/profile/${name}`);
  };

  const exampleUsers = ['torvalds', 'gaearon', 'tj', 'sindresorhus', 'kentcdodds'];

  const features = [
    {
      icon: TrendingUp,
      title: 'Activity Tracking',
      description: 'Visualize commit patterns and contribution trends over time',
    },
    {
      icon: BarChart3,
      title: 'Language Analytics',
      description: 'Discover language distribution across all repositories',
    },
    {
      icon: Code2,
      title: 'Repository Insights',
      description: 'Analyze stars, forks, and activity per repository',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Dev Analytics
              </h1>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center space-y-6 mb-12">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Analyze Any GitHub Developer
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Get detailed insights into coding activity, language usage, and contribution patterns
              </p>
            </div>

            {/* Search Form */}
            <div className="mb-12">
              <form onSubmit={handleSubmit}>
                <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-2 shadow-xl">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter GitHub username..."
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!username.trim() || isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? 'Loading...' : 'Analyze'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Example Users */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Try examples:
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {exampleUsers.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleExampleClick(name)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 mt-12">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              Built with Next.js, TypeScript, Tailwind CSS, and Recharts
            </p>
            <p className="mt-2">
              Powered by GitHub REST API
            </p>
            <p>
              Dennis Mmachoene Ramara @ {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}