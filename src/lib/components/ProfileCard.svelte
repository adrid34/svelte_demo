<script lang="ts">
  import type { GithubProfile } from '$lib/types/github';
  export let profile: GithubProfile;
</script>

<div class="flex-1">
	<div
		class="bg-white rounded-2xl shadow-xl p-8 mb-10 flex flex-col gap-8 items-center border border-blue-100"
	>
		<img
			src={profile.avatarUrl}
			alt="avatar"
			class="w-90 h-90 rounded-full border-4 border-blue-300 shadow-lg"
		/>
		<div class="flex-1">
			<div class="flex flex-col flex-wrap items-start gap-2 mb-2">
				<span class="text-2xl font-extrabold">{profile.name}</span>
				<div class="flex justify-between w-full">
					<span class="text-gray-500">@{profile.login}</span>
					<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
						>Joined {new Date(profile.createdAt).toLocaleDateString()}</span
					>
				</div>
			</div>
			<div class="mb-2 text-gray-700 italic text-sm mt-4 mb-4">{profile.bio}</div>
			<div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-3 items-center">
				{#if profile.company}
					<span class="flex items-center gap-1"
						><svg
							class="w-4 h-4 text-blue-400"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
							><path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" /><path
								d="M16 21v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"
							/></svg
						>{profile.company}</span
					>
				{/if}
				{#if profile.location}
					<span class="flex items-center gap-1"
						><svg
							class="w-4 h-4 text-pink-400"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
							><path d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1 1 16 0c0 4.97-3.582 9-8 9z" /><circle
								cx="12"
								cy="12"
								r="3"
							/></svg
						>{profile.location}</span
					>
				{/if}
				{#if profile.email}
					<span class="flex items-center gap-1"
						><svg
							class="w-4 h-4 text-green-400"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg
						>{profile.email}</span
					>
				{/if}
				{#if profile.websiteUrl}
					<a
						href={profile.websiteUrl}
						class="flex items-center gap-1 text-blue-500 hover:underline"
						target="_blank"
						><svg
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
							><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20" /></svg
						>Website</a
					>
				{/if}
				{#if profile.twitterUsername}
					<a
						href={`https://twitter.com/${profile.twitterUsername}`}
						class="flex items-center gap-1 text-blue-400 hover:underline"
						target="_blank"
						><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
							><path
								d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.01-4.52 4.5 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 0 1 .96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.82-.08.56 1.74 2.18 3 4.1 3.04A9.06 9.06 0 0 1 0 19.54a12.8 12.8 0 0 0 6.95 2.04c8.36 0 12.94-6.92 12.94-12.93 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 23 3z"
							/></svg
						>@{profile.twitterUsername}</a
					>
				{/if}
			</div>
			<div class="flex gap-6 items-center mb-2">
				<span class="font-semibold text-blue-600 flex items-center gap-1"
					><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
						><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle
							cx="9"
							cy="7"
							r="4"
						/><circle cx="17" cy="17" r="4" /></svg
					>{profile.followers.totalCount}
					<span class="font-normal text-gray-500">Followers</span></span
				>
				<span class="font-semibold text-blue-600 flex items-center gap-1"
					><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
						><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg
					>{profile.following.totalCount}
					<span class="font-normal text-gray-500">Following</span></span
				>
			</div>
			<div class="flex flex-wrap gap-2 items-center mt-2">
				{#each profile.organizations.nodes as org}
					<a
						href={org.url}
						target="_blank"
						class="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded hover:from-blue-200 hover:to-purple-200 transition shadow-sm"
					>
						<img
							src={org.avatarUrl}
							alt={org.name}
							class="w-6 h-6 rounded-full border border-blue-200"
						/>
						<span class="text-xs font-semibold text-blue-700">{org.name}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
