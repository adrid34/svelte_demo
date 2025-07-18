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

export async function GET({ params, getClientAddress }: RequestEvent) {
  const username = params.username;
  if (!username || typeof username !== 'string') {
    throw error(400, 'Invalid username');
  }

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
    const data = await graphql(
      `query($login: String!) {
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