// TypeScript types for GitHub API responses
export interface GithubRepo {
  name: string;
  stargazerCount: number;
  forkCount: number;
  description: string;
  url: string;
  languages: { nodes: { name: string }[] };
}

export interface GithubProfile {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  url: string;
  email: string;
  company: string;
  location: string;
  websiteUrl: string;
  twitterUsername: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  createdAt: string;
  organizations: { nodes: { name: string; avatarUrl: string; url: string }[] };
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: { color: string; contributionCount: number; date: string }[] }[];
    };
  };
  repositories: { nodes: GithubRepo[] };
}

export interface GithubHeatmapDay {
  color: string;
  contributionCount: number;
  date: string;
}
export interface GithubHeatmapWeek {
  contributionDays: GithubHeatmapDay[];
} 