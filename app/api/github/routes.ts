// app/api/github/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchUser,
  fetchUserRepos,
  fetchRepoLanguages,
  fetchRepoCommits,
  fetchAllLanguages,
  fetchAllCommits,
  handleGitHubError,
  githubCache,
} from '@/lib/github';
import {
  aggregateLanguages,
  processCommitTimeseries,
  calculateRepoCommits,
  calculateUserStats,
  generateInsights,
} from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * Main API handler for GitHub data
 * Endpoints:
 * - /api/github?username=user&type=user
 * - /api/github?username=user&type=repos
 * - /api/github?username=user&type=languages
 * - /api/github?username=user&type=commits&days=90
 * - /api/github?username=user&type=analytics&days=90
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const type = searchParams.get('type');
  const days = parseInt(searchParams.get('days') || '90', 10);

  // Validate required parameters
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

  try {
    // Check cache first
    const cacheKey = `${username}-${type}-${days}`;
    const cached = githubCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        data: cached,
        cached: true,
        rateLimit: null,
      });
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

    // Cache the response
    githubCache.set(cacheKey, responseData);

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
    const errorMessage = handleGitHubError(error);

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * Handle user profile request
 */
async function handleUserRequest(username: string) {
  const user = await fetchUser(username);
  return user;
}

/**
 * Handle repositories request
 */
async function handleReposRequest(username: string) {
  const repos = await fetchUserRepos(username);
  return repos;
}

/**
 * Handle languages aggregation request
 */
async function handleLanguagesRequest(username: string) {
  const repos = await fetchUserRepos(username);
  const languagesData = await fetchAllLanguages(username, repos);
  const aggregated = aggregateLanguages(repos, languagesData);

  return {
    languages: aggregated,
    totalRepos: repos.length,
  };
}

/**
 * Handle commits request
 */
async function handleCommitsRequest(username: string, days: number) {
  const repos = await fetchUserRepos(username);
  const commitsData = await fetchAllCommits(username, repos, days);

  // Flatten all commits for timeseries
  const allCommits = Array.from(commitsData.values()).flat();
  const commitTimeseries = processCommitTimeseries(
    allCommits.map((c) => ({ date: c.commit.author.date })),
    days
  );

  // Calculate per-repo commits
  const repoCommits = calculateRepoCommits(repos, commitsData);

  return {
    timeseries: commitTimeseries,
    byRepo: repoCommits,
    totalCommits: allCommits.length,
  };
}

/**
 * Handle full analytics request (combined data)
 */
async function handleAnalyticsRequest(username: string, days: number) {
  // Fetch all data in parallel
  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchUserRepos(username),
  ]);

  const [languagesData, commitsData] = await Promise.all([
    fetchAllLanguages(username, repos),
    fetchAllCommits(username, repos, days),
  ]);

  // Process analytics
  const languages = aggregateLanguages(repos, languagesData);
  const allCommits = Array.from(commitsData.values()).flat();
  const commitTimeseries = processCommitTimeseries(
    allCommits.map((c) => ({ date: c.commit.author.date })),
    days
  );
  const repoCommits = calculateRepoCommits(repos, commitsData);
  const stats = calculateUserStats(repos, languages, commitsData);
  const insights = generateInsights(stats, commitTimeseries);

  return {
    user,
    repos: repos.slice(0, 20), // Top 20 repos
    languages,
    commits: {
      timeseries: commitTimeseries,
      byRepo: repoCommits,
      total: allCommits.length,
    },
    stats,
    insights,
  };
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}