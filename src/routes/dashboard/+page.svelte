<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { writable } from 'svelte/store';
  import Chart from 'chart.js/auto';

  let username = '';
  let input = '';
  const loading = writable(false);
  const error = writable('');
  const profile = writable<any>(null);

  let repoChart: HTMLCanvasElement;
  let langChart: HTMLCanvasElement;
  let repoChartInstance: Chart;
  let langChartInstance: Chart;

  async function fetchProfile() {
    error.set('');
    profile.set(null);
    loading.set(true);
    try {
      const res = await fetch(`/api/github/${input}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      profile.set(data.user);
      username = input;
      await tick(); // Wait for DOM to update
      drawCharts(data.user);
    } catch (e: any) {
      error.set(e.message || 'Error fetching profile');
    } finally {
      loading.set(false);
    }
  }

  function drawCharts(user: any) {
    if (!user) return;
    // Repo stars chart
    const repoNames = user.repositories.nodes.map((r: any) => r.name);
    const repoStars = user.repositories.nodes.map((r: any) => r.stargazerCount);
    if (repoChartInstance) repoChartInstance.destroy();
    repoChartInstance = new Chart(repoChart, {
      type: 'bar',
      data: {
        labels: repoNames,
        datasets: [{
          label: 'Stars',
          data: repoStars,
          backgroundColor: 'rgba(59,130,246,0.5)'
        }]
      },
      options: { responsive: true }
    });
    // Language breakdown chart
    const langCounts: Record<string, number> = {};
    user.repositories.nodes.forEach((r: any) => {
      r.languages.nodes.forEach((l: any) => {
        langCounts[l.name] = (langCounts[l.name] || 0) + 1;
      });
    });
    if (langChartInstance) langChartInstance.destroy();
    langChartInstance = new Chart(langChart, {
      type: 'doughnut',
      data: {
        labels: Object.keys(langCounts),
        datasets: [{
          label: 'Languages',
          data: Object.values(langCounts),
          backgroundColor: [
            'rgba(59,130,246,0.5)',
            'rgba(16,185,129,0.5)',
            'rgba(234,179,8,0.5)',
            'rgba(239,68,68,0.5)',
            'rgba(168,85,247,0.5)'
          ]
        }]
      },
      options: { responsive: true }
    });
  }
</script>

<div class="max-w-xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">GitHub Profile Dashboard</h1>
  <form on:submit|preventDefault={fetchProfile} class="flex gap-2 mb-4">
    <input class="border rounded px-2 py-1 flex-1" bind:value={input} placeholder="Enter GitHub username" />
    <button class="bg-blue-500 text-white px-4 py-1 rounded" type="submit" disabled={$loading}>Analyze</button>
  </form>
  {#if $error}
    <div class="text-red-500 mb-2">{$error}</div>
  {/if}
  {#if $loading}
    <div>Loading...</div>
  {/if}
  {#if $profile}
    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="flex items-center gap-4 mb-2">
        <img src="{$profile.avatarUrl}" alt="avatar" class="w-16 h-16 rounded-full" />
        <div>
          <div class="font-bold text-lg">{$profile.name} ({$profile.login})</div>
          <div class="text-gray-600">{$profile.bio}</div>
          <a href="{$profile.url}" class="text-blue-500" target="_blank">View on GitHub</a>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 class="font-semibold mb-2">Top Repositories (Stars)</h2>
          <canvas bind:this={repoChart}></canvas>
        </div>
        <div>
          <h2 class="font-semibold mb-2">Language Breakdown</h2>
          <canvas bind:this={langChart}></canvas>
        </div>
      </div>
    </div>
  {/if}
</div> 