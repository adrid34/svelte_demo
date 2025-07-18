import { json, error } from '@sveltejs/kit';
import { graphql } from '@octokit/graphql';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { github_cache } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window per IP
const rateLimitMap = new Map<string, { count: number; reset: number }>();

export async function GET({ params, getClientAddress, url }: RequestEvent) {
  const username = params.username;
  if (!username || typeof username !== 'string') {
    throw error(400, 'Invalid username');
  }

  // Get year from query string, default to current year
  let year = Number(url.searchParams.get('year')) || new Date().getFullYear();
  if (year < 2008 || year > 2100) year = new Date().getFullYear();

  // Rate limiting by IP
  const ip = getClientAddress();
  const now = Date.now();
  const rl = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };
  if (now > rl.reset) {
    rl.count = 0;
    rl.reset = now + RATE_LIMIT_WINDOW;
  }
  rl.count++;
  rateLimitMap.set(ip, rl);
  if (rl.count > RATE_LIMIT_MAX) {
    throw error(429, 'Rate limit exceeded');
  }

  // Database cache lookup
  const cacheRows = await db.select().from(github_cache).where(eq(github_cache.username, username.toLowerCase()));
  if (cacheRows.length > 0) {
    const cached = cacheRows[0];
    if (cached.expires.getTime() > now) {
      return json(cached.data);
    }
  }

  // GitHub API call
  const token = env.GITHUB_TOKEN;
  if (!token) throw error(500, 'GitHub token not set');
  try {
    const from = `${year}-01-01T00:00:00Z`;
    const to = `${year}-12-31T23:59:59Z`;
    const data = await graphql(
      `query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          login
          name
          avatarUrl
          bio
          url
          email
          company
          location
          websiteUrl
          twitterUsername
          followers { totalCount }
          following { totalCount }
          createdAt
          organizations(first: 10) {
            nodes {
              name
              avatarUrl
              url
            }
          }
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                }
              }
            }
          }
          repositories(first: 10, orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              name
              stargazerCount
              forkCount
              description
              url
              languages(first: 5) {
                nodes { name }
              }
            }
          }
        }
      }`,
      {
        login: username,
        from,
        to,
        headers: { authorization: `token ${token}` }
      }
    );
    // Upsert cache
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    if (cacheRows.length > 0) {
      await db.update(github_cache)
        .set({ data, expires })
        .where(eq(github_cache.username, username.toLowerCase()));
    } else {
      await db.insert(github_cache).values({
        username: username.toLowerCase(),
        data,
        expires
      });
    }
    return json(data);
  } catch (e) {
    console.error(e); // Log the real error for debugging
    throw error(404, 'GitHub user not found or API error');
  }
} 