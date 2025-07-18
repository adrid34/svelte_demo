<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGithubHeatmap } from '$lib/api/github';
	import { getGithubGreen, shadeColor } from '$lib/utils/colors';
	import type { GithubHeatmapWeek } from '$lib/types/github';
	export let weeks: GithubHeatmapWeek[] = [];
	export let username: string;

	let days: any[] = [];
	let months: string[] = [];
	let maxCount = 1;
	let year = new Date().getFullYear();
	const currentYear = year;
	const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
	let loading = false;
	let error = '';

	async function fetchHeatmap() {
		if (!username) return;
		loading = true;
		error = '';
		try {
			const data = await fetchGithubHeatmap(username, year);
			weeks = data.weeks;
			maxCount = 1;
			for (const w of weeks)
				for (const d of w.contributionDays)
					if (d.contributionCount > maxCount) maxCount = d.contributionCount;
		} catch (e: any) {
			error = e.message || 'Error fetching heatmap';
			weeks = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (username) fetchHeatmap();
	});

	// Isometric board parameters
	const cell = 2; // smaller base tile size
	const gap = 1; // smaller gap
	const cubeHeight = 6; // max cube height (already reduced)
	const leftPad = 12;
	const topPad = 6;
	const cols = weeks.length;
	const rows = 7;

	function iso(x: number, y: number, z: number = 0) {
		return [leftPad + ((x - y) * (cell + gap)) / 2, topPad + ((x + y) * (cell + gap)) / 4 - z];
	}

	function getTilePoints(x: number, y: number) {
		const p1 = iso(x, y);
		const p2 = iso(x + 1, y);
		const p3 = iso(x + 1, y + 1);
		const p4 = iso(x, y + 1);
		return [p1, p2, p3, p4];
	}

	function getCubePolys(x: number, y: number, h: number) {
		const top = [iso(x, y, h), iso(x + 1, y, h), iso(x + 1, y + 1, h), iso(x, y + 1, h)];
		const left = [iso(x, y + 1, 0), iso(x + 1, y + 1, 0), iso(x + 1, y + 1, h), iso(x, y + 1, h)];
		const right = [iso(x + 1, y, 0), iso(x + 1, y + 1, 0), iso(x + 1, y + 1, h), iso(x + 1, y, h)];
		return { top, left, right };
	}

	function renderCube(day: any) {
		const h =
			day.contributionCount > 0 ? 1 + (cubeHeight - 1) * (day.contributionCount / maxCount) : 0;
		const { top, left, right } = getCubePolys(day.col, day.row, h);
		const topColor = getGithubGreen(day.contributionCount);
		const leftColor = shadeColor(topColor, -30);
		const rightColor = shadeColor(topColor, -15);
		return `
      <polygon points="${top.map((p) => p.join(',')).join(' ')}" fill="${topColor}"/>
      <polygon points="${left.map((p) => p.join(',')).join(' ')}" fill="${leftColor}"/>
      <polygon points="${right.map((p) => p.join(',')).join(' ')}" fill="${rightColor}"/>
      <title>${day.date}: ${day.contributionCount} contributions</title>
    `;
	}

	function renderGridTile(day: any) {
		const points = getTilePoints(day.col, day.row)
			.map((p) => p.join(','))
			.join(' ');
		return `<polygon points="${points}" fill="#fff" stroke="#e5e7eb" stroke-width="0.3"/>`;
	}

	$: {
		days = [];
		months = [];
		if (weeks.length > 0) {
			for (let col = 0; col < weeks.length; col++) {
				for (let row = 0; row < weeks[col].contributionDays.length; row++) {
					const day = weeks[col].contributionDays[row];
					days.push({ ...day, col, row });
				}
				const firstDay = weeks[col].contributionDays[0];
				const month = new Date(firstDay.date).toLocaleString('default', { month: 'short' });
				if (
					col === 0 ||
					new Date(weeks[col - 1].contributionDays[0].date).getMonth() !==
						new Date(firstDay.date).getMonth()
				) {
					months.push(month);
				} else {
					months.push('');
				}
			}
		}
	}
</script>

<div class="relative w-full mb-4">
	<div class="absolute right-0 top-0 flex gap-2 items-center z-10">
		{#if loading}
			<span class="ml-2 text-blue-500 animate-pulse">Loading...</span>
		{/if}
		{#if error}
			<span class="ml-2 text-red-500">{error}</span>
		{/if}
		<select
			id="year"
			class="border rounded-lg px-2 py-1 shadow bg-white"
			bind:value={year}
			on:change={fetchHeatmap}
		>
			{#each years as y}
				<option value={y}>{y}</option>
			{/each}
		</select>
	</div>
</div>

<div class="w-full mx-auto">
	<svg
		viewBox={`0 0 94 60`}
		width="100%"
		height="auto"
		style="display: block; width: 100%; height: auto;"
		font-family="sans-serif"
	>
		<!-- Grid Tiles -->
		<g>
			{#each days as day}
				{#key day.date}
					{@html renderGridTile(day)}
				{/key}
			{/each}
		</g>
		<!-- 3D Cubes -->
		<g>
			{#each days as day}
				{#if day.contributionCount > 0}
					{#key day.date}
						{@html renderCube(day)}
					{/key}
				{/if}
			{/each}
		</g>
	</svg>
</div>
