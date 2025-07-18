<script lang="ts">
  import type { GithubRepo } from '$lib/types/github';
  export let repos: GithubRepo[] = [];
</script>

<div class="bg-white rounded-2xl shadow p-8 mb-10 border border-gray-200">
  <h2 class="font-semibold mb-4 text-black">Top Repositories</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each repos as repo}
      <a href={repo.url} target="_blank" class="block bg-white hover:bg-gray-100 rounded-xl p-5 shadow transition border border-gray-200">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-black text-lg">{repo.name}</span>
          <span class="ml-auto text-xs text-gray-500">⭐ {repo.stargazerCount} | 🍴 {repo.forkCount}</span>
        </div>
        <div class="text-gray-700 text-sm mb-1 italic">{repo.description}</div>
        <div class="flex flex-wrap gap-2 mt-2">
          {#each repo.languages.nodes as lang}
            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{lang.name}</span>
          {/each}
        </div>
      </a>
    {/each}
  </div>
</div> 