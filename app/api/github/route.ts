// app/api/github/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_PAT = process.env.GITHUB_PAT;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchFromGitHub(url: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (GITHUB_PAT) {
    headers['Authorization'] = `Bearer ${GITHUB_PAT}`;
  }

  const response = await fetch(url, { 
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function handleUserRequest(username: string) {
  const cacheKey = `user:${username}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/users/${username}`;
  const data = await fetchFromGitHub(url);
  
  setCache(cacheKey, data);
  return data;
}

async function handleReposRequest(username: string) {
  const cacheKey = `repos:${username}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed&type=owner`;
  const data = await fetchFromGitHub(url);
  
  setCache(cacheKey, data);
  return data;
}

async function handleLanguagesRequest(username: string) {
  const repos = await handleReposRequest(username);
  const languagesMap = new Map<string, Record<string, number>>();

  // Fetch languages for top 30 repos to avoid rate limits
  const topRepos = repos.slice(0, 30);
  
  await Promise.all(
    topRepos.map(async (repo: any) => {
      try {
        const url = `${GITHUB_API_BASE}/repos/${username}/${repo.name}/languages`;
        const languages = await fetchFromGitHub(url);
        languagesMap.set(repo.name, languages);
      } catch (error) {
        console.error(`Failed to fetch languages for ${repo.name}`);
      }
    })
  );

  // Aggregate languages
  const aggregated = new Map<string, { bytes: number; repos: Set<string> }>();
  
  languagesMap.forEach((languages, repoName) => {
    Object.entries(languages).forEach(([lang, bytes]) => {
      const existing = aggregated.get(lang) || { bytes: 0, repos: new Set() };
      existing.bytes += bytes as number;
      existing.repos.add(repoName);
      aggregated.set(lang, existing);
    });
  });

  const totalBytes = Array.from(aggregated.values()).reduce(
    (sum, data) => sum + data.bytes,
    0
  );

  const languageColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Go: '#00add8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
  };

  const languages = Array.from(aggregated.entries())
    .map(([name, data]) => ({
      name,
      bytes: data.bytes,
      repos: data.repos.size,
      percentage: totalBytes > 0 ? (data.bytes / totalBytes) * 100 : 0,
      color: languageColors[name] || '#64748b',
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return { languages, totalRepos: repos.length };
}

async function handleCommitsRequest(username: string, days: number) {
  const repos = await handleReposRequest(username);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const commitsMap = new Map<string, any[]>();
  
  // Fetch commits for top 20 repos only to avoid rate limits
  const topRepos = repos
    .sort((a: any, b: any) => 
      new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, 20);

  await Promise.all(
    topRepos.map(async (repo: any) => {
      try {
        const url = `${GITHUB_API_BASE}/repos/${username}/${repo.name}/commits?since=${since}&per_page=100`;
        const commits = await fetchFromGitHub(url);
        if (commits.length > 0) {
          commitsMap.set(repo.name, commits);
        }
      } catch (error) {
        console.error(`Failed to fetch commits for ${repo.name}`);
      }
    })
  );

  // Create timeseries
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    buckets.set(dateStr, 0);
  }

  let totalCommits = 0;
  commitsMap.forEach((commits) => {
    commits.forEach((commit: any) => {
      totalCommits++;
      const date = new Date(commit.commit.author.date);
      const dateStr = date.toISOString().split('T')[0];
      if (buckets.has(dateStr)) {
        buckets.set(dateStr, (buckets.get(dateStr) || 0) + 1);
      }
    });
  });

  const timeseries = Array.from(buckets.entries())
    .map(([dateStr, commits]) => ({
      date: new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      commits,
      timestamp: new Date(dateStr).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const byRepo = Array.from(commitsMap.entries())
    .map(([name, commits]) => ({
      name,
      commits: commits.length,
      url: `https://github.com/${username}/${name}`,
    }))
    .sort((a, b) => b.commits - a.commits);

  return {
    timeseries,
    byRepo,
    totalCommits,
  };
}

async function handleAnalyticsRequest(username: string, days: number) {
  const [user, repos] = await Promise.all([
    handleUserRequest(username),
    handleReposRequest(username),
  ]);

  const [languagesData, commitsData] = await Promise.all([
    handleLanguagesRequest(username),
    handleCommitsRequest(username, days),
  ]);

  const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);

  const stats = {
    totalStars,
    totalForks,
    totalRepos: repos.length,
    totalCommits: commitsData.totalCommits,
    topLanguage: languagesData.languages.length > 0 ? languagesData.languages[0].name : null,
    mostActiveRepo: commitsData.byRepo.length > 0 ? commitsData.byRepo[0].name : null,
  };

  const insights: string[] = [];
  if (stats.topLanguage) {
    insights.push(`Most used language: ${stats.topLanguage}`);
  }
  if (stats.mostActiveRepo) {
    insights.push(`Most active repository: ${stats.mostActiveRepo}`);
  }
  if (commitsData.timeseries.length > 0) {
    const avgCommits = (commitsData.totalCommits / commitsData.timeseries.length).toFixed(1);
    insights.push(`Average commits per day: ${avgCommits}`);
  }

  return {
    user,
    repos: repos.slice(0, 20),
    languages: languagesData.languages,
    commits: commitsData,
    stats,
    insights,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const type = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '90', 10);

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      );
    }

    let responseData: any;

    switch (type) {
      case 'user':
        responseData = await handleUserRequest(username);
        break;

      case 'repos':
        responseData = await handleReposRequest(username);
        break;

      case 'languages':
        responseData = await handleLanguagesRequest(username);
        break;

      case 'commits':
        responseData = await handleCommitsRequest(username, days);
        break;

      case 'analytics':
        responseData = await handleAnalyticsRequest(username, days);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data: responseData,
      cached: false,
      rateLimit: {
        remaining: null,
        reset: null,
      },
    });
  } catch (error: any) {
    console.error('GitHub API Error:', error);
    
    let errorMessage = 'Failed to fetch data from GitHub';
    let statusCode = 500;

    if (error.message.includes('404')) {
      errorMessage = 'User not found';
      statusCode = 404;
    } else if (error.message.includes('403')) {
      errorMessage = 'Rate limit exceeded. Please add a GitHub Personal Access Token.';
      statusCode = 429;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}