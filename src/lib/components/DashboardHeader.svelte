<script lang="ts">
  export let input: string;
  export let loading: boolean;
  export let setInput: (v: string) => void;
  export let fetchProfile: () => void;
</script>

<div class="flex gap-2 mb-8 justify-center items-center">
  <input
    class="border rounded-lg px-4 py-2 flex-1 max-w-xs shadow focus:ring-2 focus:ring-blue-400 transition"
    bind:value={input}
    on:input={e => setInput(e.target.value)}
    placeholder="Enter GitHub username"
  />
  <button
    class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg shadow font-semibold transition"
    type="button"
    on:click={fetchProfile}
    disabled={loading}
  >
    Analyze
  </button>
</div> 