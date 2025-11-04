// types/github.ts

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics: string[];
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface LanguageData {
  name: string;
  bytes: number;
  repos: number;
  percentage: number;
  color: string;
}

export interface CommitData {
  date: string;
  commits: number;
  timestamp: number;
}

export interface RepoCommitData {
  name: string;
  commits: number;
  url: string;
}

export interface UserStats {
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalCommits: number;
  topLanguage: string | null;
  mostActiveRepo: string | null;
}

export interface APIResponse<T> {
  data: T;
  rateLimit: {
    remaining: string | null;
    reset: string | null;
  };
  error?: string;
}