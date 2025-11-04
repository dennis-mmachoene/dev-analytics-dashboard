// lib/analytics.ts

import { GitHubRepo, GitHubLanguages, LanguageData, CommitData, RepoCommitData, UserStats } from '@/types/github';

// Language colors based on GitHub's language colors
const LANGUAGE_COLORS: Record<string, string> = {
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
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  React: '#61dafb',
};

/**
 * Generate a random color for languages not in our preset list
 */
function generateRandomColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return '#' + '000000'.substring(0, 6 - color.length) + color;
}

/**
 * Aggregate language data from multiple repositories
 */
export function aggregateLanguages(
  reposData: GitHubRepo[],
  languagesData: Map<string, GitHubLanguages>
): LanguageData[] {
  const langMap = new Map<string, { bytes: number; repos: Set<string> }>();

  // Process each repo's languages
  reposData.forEach((repo) => {
    const repoLangs = languagesData.get(repo.name);
    if (repoLangs) {
      Object.entries(repoLangs).forEach(([lang, bytes]) => {
        const existing = langMap.get(lang) || { bytes: 0, repos: new Set() };
        existing.bytes += bytes;
        existing.repos.add(repo.name);
        langMap.set(lang, existing);
      });
    }
  });

  // Calculate total bytes for percentages
  const totalBytes = Array.from(langMap.values()).reduce(
    (sum, data) => sum + data.bytes,
    0
  );

  // Convert to array and sort by bytes
  return Array.from(langMap.entries())
    .map(([name, data]) => ({
      name,
      bytes: data.bytes,
      repos: data.repos.size,
      percentage: totalBytes > 0 ? (data.bytes / totalBytes) * 100 : 0,
      color: LANGUAGE_COLORS[name] || generateRandomColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

/**
 * Process commits into time-series data
 */
export function processCommitTimeseries(
  commits: Array<{ date: string }>,
  days: number = 90
): CommitData[] {
  const now = Date.now();
  const startDate = now - days * 24 * 60 * 60 * 1000;

  // Create buckets for each day
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    buckets.set(dateStr, 0);
  }

  // Count commits per day
  commits.forEach((commit) => {
    const commitDate = new Date(commit.date);
    const dateStr = commitDate.toISOString().split('T')[0];
    if (buckets.has(dateStr)) {
      buckets.set(dateStr, (buckets.get(dateStr) || 0) + 1);
    }
  });

  // Convert to array format for charts
  return Array.from(buckets.entries())
    .map(([dateStr, commits]) => ({
      date: new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      commits,
      timestamp: new Date(dateStr).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Calculate commits per repository
 */
export function calculateRepoCommits(
  reposData: GitHubRepo[],
  commitsData: Map<string, any[]>
): RepoCommitData[] {
  return reposData
    .map((repo) => ({
      name: repo.name,
      commits: commitsData.get(repo.name)?.length || 0,
      url: repo.html_url,
    }))
    .filter((repo) => repo.commits > 0)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10);
}

/**
 * Calculate overall user statistics
 */
export function calculateUserStats(
  repos: GitHubRepo[],
  languages: LanguageData[],
  commits: Map<string, any[]>
): UserStats {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalCommits = Array.from(commits.values()).reduce(
    (sum, repoCommits) => sum + repoCommits.length,
    0
  );

  const topLanguage = languages.length > 0 ? languages[0].name : null;

  const repoCommitCounts = Array.from(commits.entries()).map(([name, commits]) => ({
    name,
    count: commits.length,
  }));
  repoCommitCounts.sort((a, b) => b.count - a.count);
  const mostActiveRepo =
    repoCommitCounts.length > 0 ? repoCommitCounts[0].name : null;

  return {
    totalStars,
    totalForks,
    totalRepos: repos.length,
    totalCommits,
    topLanguage,
    mostActiveRepo,
  };
}

/**
 * Create contribution heatmap data (weeks x days grid)
 */
export function createHeatmapData(commits: CommitData[]): Array<{
  week: number;
  day: number;
  commits: number;
  date: string;
}> {
  const heatmapData: Array<{
    week: number;
    day: number;
    commits: number;
    date: string;
  }> = [];

  if (commits.length === 0) return heatmapData;

  // Get the earliest date to start from
  const startDate = new Date(commits[0].timestamp);
  startDate.setHours(0, 0, 0, 0);

  // Create a map of date string to commit count
  const commitMap = new Map<string, number>();
  commits.forEach((commit) => {
    const date = new Date(commit.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    commitMap.set(dateStr, commit.commits);
  });

  // Generate grid data
  let currentDate = new Date(startDate);
  let weekNum = 0;

  for (let i = 0; i < commits.length; i++) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    heatmapData.push({
      week: weekNum,
      day: dayOfWeek,
      commits: commitMap.get(dateStr) || 0,
      date: dateStr,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);

    // Increment week on Sunday
    if (dayOfWeek === 6) {
      weekNum++;
    }
  }

  return heatmapData;
}

/**
 * Get insights/summary from the data
 */
export function generateInsights(
  stats: UserStats,
  commits: CommitData[]
): string[] {
  const insights: string[] = [];

  if (stats.topLanguage) {
    insights.push(`Most used language: ${stats.topLanguage}`);
  }

  if (stats.mostActiveRepo) {
    insights.push(`Most active repository: ${stats.mostActiveRepo}`);
  }

  // Find peak commit day
  if (commits.length > 0) {
    const maxCommitDay = commits.reduce((max, day) =>
      day.commits > max.commits ? day : max
    );
    if (maxCommitDay.commits > 0) {
      insights.push(
        `Peak activity day: ${maxCommitDay.date} with ${maxCommitDay.commits} commits`
      );
    }
  }

  // Calculate average commits per day
  if (commits.length > 0) {
    const totalCommits = commits.reduce((sum, day) => sum + day.commits, 0);
    const avgCommits = (totalCommits / commits.length).toFixed(1);
    insights.push(`Average commits per day: ${avgCommits}`);
  }

  return insights;
}