import { writable } from 'svelte/store';
import type { GithubProfile } from '$lib/types/github';

export const profile = writable<GithubProfile | null>(null); 