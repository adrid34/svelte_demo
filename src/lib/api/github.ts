// API abstraction for GitHub profile
export async function fetchGithubProfile(username: string): Promise<any> {
  const res = await fetch(`/api/github/${username}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.user;
}

export async function fetchGithubHeatmap(username: string, year: number): Promise<{ weeks: any[] }> {
  const res = await fetch(`/api/github/${username}/heatmap?year=${year}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 