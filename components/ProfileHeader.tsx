// components/ProfileHeader.tsx

import { GitHubUser } from '@/types/github';
import { Users, MapPin, Link as LinkIcon, Building, Twitter, Calendar } from 'lucide-react';
import GlassCard from './ui/GlassCard';

interface ProfileHeaderProps {
  user: GitHubUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <GlassCard>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {user.name || user.login}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                @{user.login}
              </p>
            </div>
            {user.hireable && (
              <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                Available for hire
              </span>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user.followers.toLocaleString()}
                </span>{' '}
                followers
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user.following.toLocaleString()}
                </span>{' '}
                following
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinDate}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {user.company && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Building className="w-4 h-4" />
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.blog && (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{user.blog}</span>
              </a>
            )}
            {user.twitter_username && (
              <a
                href={`https://twitter.com/${user.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
              >
                <Twitter className="w-4 h-4" />
                <span>@{user.twitter_username}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}