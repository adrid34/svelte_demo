<script lang="ts">
	import { tick } from 'svelte';
	import { writable } from 'svelte/store';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ActivityHeatmap from '$lib/components/ActivityHeatmap.svelte';
	import TopRepos from '$lib/components/TopRepos.svelte';
	import DashboardHeader from '$lib/components/DashboardHeader.svelte';
	import { fetchGithubProfile } from '$lib/api/github';
	import type { GithubProfile } from '$lib/types/github';
	import { profile } from '$lib/stores/profile';

	let username = '';
	let input = '';
	const loading = writable(false);
	const error = writable('');
	// const profile = writable<GithubProfile | null>(null); // removed, now imported

	let activityWeeks: any[] = [];
	$: if ($profile && $profile.contributionsCollection) {
		activityWeeks = $profile.contributionsCollection.contributionCalendar.weeks;
	}

	let year = new Date().getFullYear();
	function setYear(y: number) {
		year = y;
	}

	function setInput(v: string) {
		input = v;
	}

	async function fetchProfile() {
		error.set('');
		profile.set(null);
		loading.set(true);
		try {
			const user = await fetchGithubProfile(input);
			profile.set(user);
			username = input;
			await tick();
		} catch (e: any) {
			error.set(e.message || 'Error fetching profile');
		} finally {
			loading.set(false);
		}
	}
</script>

<div class="max-w-6xl mx-auto p-4">
	<h1
		class="text-3xl font-extrabold mb-8 text-center tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text"
	>
		GitHub Profile Dashboard
	</h1>
	<DashboardHeader {input} loading={$loading} {setInput} {fetchProfile} />
	{#if $error}
		<div class="text-red-500 mb-4 text-center font-semibold">{$error}</div>
	{/if}
	{#if $loading}
		<div class="text-center animate-pulse text-blue-600 font-semibold">Loading...</div>
	{/if}
	{#if $profile}
		<div class="flex flex-col md:flex-row">
			<ProfileCard profile={$profile} />
			<div class="flex flex-col flex-3 ml-4">
				<ActivityHeatmap {username} />
				<TopRepos repos={$profile.repositories.nodes} />
			</div>
		</div>
	{/if}
</div>
