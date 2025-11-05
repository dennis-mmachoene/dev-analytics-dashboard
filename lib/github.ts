// lib/github.ts
import axios from 'axios';
import { GitHubUser, GitHubRepo, GitHubLanguages, GitHubCommit, APIResponse } from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Create GitHub API client with authentication
 */
function createGitHubClient() {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // In production, this should come from environment variables server-side
  const token = process.env.GITHUB_PAT || process.env.NEXT_PUBLIC_GITHUB_PAT;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers,
    timeout: 10000,
  });
}

/**
 * Fetch user profile data
 */
export async function fetchUser(username: string): Promise<GitHubUser> {
  const client = createGitHubClient();
  const response = await client.get<GitHubUser>(`/users/${username}`);
  return response.data;
}

/**
 * Fetch user's repositories
 */
export async function fetchUserRepos(
  username: string,
  perPage: number = 100
): Promise<GitHubRepo[]> {
  const client = createGitHubClient();
  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && repos.length < 100) {
    const response = await client.get<GitHubRepo[]>(`/users/${username}/repos`, {
      params: {
        per_page: perPage,
        page,
        sort: 'pushed',
        direction: 'desc',
        type: 'owner',
      },
    });

    repos.push(...response.data);
    hasMore = response.data.length === perPage;
    page++;
  }

  return repos;
}

/**
 * Fetch languages for a specific repository
 */
export async function fetchRepoLanguages(
  owner: string,
  repo: string
): Promise<GitHubLanguages> {
  const client = createGitHubClient();
  const response = await client.get<GitHubLanguages>(
    `/repos/${owner}/${repo}/languages`
  );
  return response.data;
}

/**
 * Fetch commits for a repository within a date range
 */
export async function fetchRepoCommits(
  owner: string,
  repo: string,
  since?: string,
  until?: string,
  perPage: number = 100
): Promise<GitHubCommit[]> {
  const client = createGitHubClient();
  const commits: GitHubCommit[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && commits.length < 1000) {
    try {
      const response = await client.get<GitHubCommit[]>(
        `/repos/${owner}/${repo}/commits`,
        {
          params: {
            per_page: Math.min(perPage, 100),
            page,
            since,
            until,
          },
        }
      );

      commits.push(...response.data);
      hasMore = response.data.length === perPage;
      page++;
    } catch (error: any) {
      // Handle empty repositories or rate limits
      if (error.response?.status === 409 || error.response?.status === 404) {
        break;
      }
      throw error;
    }
  }

  return commits;
}

/**
 * Fetch all languages across all repositories
 */
export async function fetchAllLanguages(
  username: string,
  repos: GitHubRepo[]
): Promise<Map<string, GitHubLanguages>> {
  const languagesMap = new Map<string, GitHubLanguages>();

  // Fetch languages for each repo (with rate limiting consideration)
  const promises = repos.slice(0, 50).map(async (repo) => {
    try {
      const languages = await fetchRepoLanguages(username, repo.name);
      languagesMap.set(repo.name, languages);
    } catch (error) {
      console.error(`Failed to fetch languages for ${repo.name}:`, error);
    }
  });

  await Promise.all(promises);
  return languagesMap;
}

/**
 * Fetch commits for multiple repositories
 */
export async function fetchAllCommits(
  username: string,
  repos: GitHubRepo[],
  days: number = 90
): Promise<Map<string, GitHubCommit[]>> {
  const commitsMap = new Map<string, GitHubCommit[]>();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch commits for top repos only to avoid rate limits
  const topRepos = repos
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 20);

  const promises = topRepos.map(async (repo) => {
    try {
      const commits = await fetchRepoCommits(username, repo.name, since);
      commitsMap.set(repo.name, commits);
    } catch (error) {
      console.error(`Failed to fetch commits for ${repo.name}:`, error);
    }
  });

  await Promise.all(promises);
  return commitsMap;
}

/**
 * Check rate limit status
 */
export async function checkRateLimit(): Promise<{
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const client = createGitHubClient();
  const response = await client.get('/rate_limit');
  const { limit, remaining, reset } = response.data.rate;

  return {
    limit,
    remaining,
    reset: new Date(reset * 1000),
  };
}

/**
 * Error handler for GitHub API errors
 */
export function handleGitHubError(error: any): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return 'User not found';
    } else if (error.response?.status === 403) {
      return 'Rate limit exceeded. Please try again later or add a GitHub Personal Access Token.';
    } else if (error.response?.status === 401) {
      return 'Invalid GitHub Personal Access Token';
    }
  }
  return 'Failed to fetch data from GitHub. Please try again.';
}

/**
 * Cache wrapper for GitHub API calls
 */
export class GitHubCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number;

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export singleton cache instance
export const githubCache = new GitHubCache(60);