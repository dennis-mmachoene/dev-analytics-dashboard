// app/profile/[username]/layout.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileHeader from '@/components/ProfileHeader';
import TabNavigation from '@/components/TabNavigation';
import { GitHubUser } from '@/types/github';

export default function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/github?username=${resolvedParams.username}&type=user`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user');
        }

        const result = await response.json();
        setUser(result.data);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [resolvedParams.username]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
                <div className="flex items-center gap-3">
                  <Github className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Dev Analytics
                  </h1>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading profile...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <div className="backdrop-blur-md bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {error}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Please check the username and try again
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* Profile Header */}
              <ProfileHeader user={user} />

              {/* Tab Navigation */}
              <TabNavigation username={resolvedParams.username} />

              {/* Tab Content */}
              {children}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}