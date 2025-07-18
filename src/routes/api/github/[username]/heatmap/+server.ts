import { json, error } from '@sveltejs/kit';
import { graphql } from '@octokit/graphql';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ params, url }: RequestEvent) {
  const username = params.username;
  if (!username || typeof username !== 'string') {
    throw error(400, 'Invalid username');
  }

  let year = Number(url.searchParams.get('year')) || new Date().getFullYear();
  if (year < 2008 || year > 2100) year = new Date().getFullYear();

  const token = env.GITHUB_TOKEN;
  if (!token) throw error(500, 'GitHub token not set');
  try {
    const from = `${year}-01-01T00:00:00Z`;
    const to = `${year}-12-31T23:59:59Z`;
    const data = await graphql(
      `query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
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
        }
      }`,
      {
        login: username,
        from,
        to,
        headers: { authorization: `token ${token}` }
      }
    );
    return json(data.user.contributionsCollection.contributionCalendar);
  } catch (e) {
    throw error(404, 'GitHub user not found or API error');
  }
} 