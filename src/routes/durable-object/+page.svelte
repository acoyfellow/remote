<script lang="ts">
  import { getCounter, incrementCounter } from "./data.remote";

  let counterId = $state("default");
  let counterData = $state<any>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function refreshCounter() {
    if (loading) return;

    loading = true;
    error = null;

    try {
      counterData = await getCounter(counterId);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error("Error getting counter:", e);
    } finally {
      loading = false;
    }
  }

  async function increment() {
    if (loading) return;

    loading = true;
    error = null;

    try {
      counterData = await incrementCounter(counterId);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error("Error incrementing:", e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold mb-6">Durable Object Counter Demo</h1>

  <div class="space-y-6">
    <!-- Counter ID Selection -->
    <div class="border p-4 rounded">
      <h2 class="text-lg font-semibold mb-3">Counter Instance</h2>
      <div class="flex gap-2 items-center">
        <label class="text-sm font-medium">Counter ID:</label>
        <input
          bind:value={counterId}
          class="px-3 py-2 border rounded flex-1 max-w-xs"
          placeholder="Enter counter ID"
        />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          onclick={refreshCounter}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Counter"}
        </button>
      </div>
      <p class="text-xs text-gray-600 mt-2">
        Different IDs create separate Durable Object instances
      </p>
    </div>

    <!-- Counter Display -->
    <div class="border p-4 rounded">
      <h2 class="text-lg font-semibold mb-3">Current State</h2>
      {#if error}
        <div class="bg-red-50 border border-red-200 p-3 rounded text-red-800">
          <strong>Error:</strong>
          {error}
        </div>
      {:else if counterData}
        <div class="bg-gray-50 p-4 rounded">
          <div class="text-3xl font-bold text-center mb-2">
            {counterData.count}
          </div>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>DO Instance ID:</strong> {counterData.id}</p>
            <p>
              <strong>Last Updated:</strong>
              {new Date(counterData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      {:else if loading}
        <div class="text-center py-8">
          <div
            class="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
          ></div>
          <p class="mt-2">Loading counter...</p>
        </div>
      {:else}
        <p class="text-gray-500">Click "Load Counter" to get started</p>
      {/if}
    </div>

    <!-- Counter Controls -->
    <div class="border p-4 rounded">
      <h2 class="text-lg font-semibold mb-3">Controls</h2>
      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          onclick={increment}
          disabled={loading}
        >
          +1 Increment
        </button>

        <button
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          onclick={refreshCounter}
          disabled={loading}
        >
          🔍 Refresh
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="bg-blue-50 border border-blue-200 p-4 rounded">
      <h3 class="font-semibold text-blue-800 mb-2">How This Works</h3>
      <div class="text-sm text-blue-700 space-y-2">
        <p><strong>Client → Remote Function → Durable Object</strong></p>
        <p>1. Click "Load Counter" to manually fetch DO state</p>
        <p>2. Click "Increment" to modify the DO and get updated state</p>
        <p>3. Try different counter IDs to see separate instances</p>
      </div>
    </div>
  </div>
</div>
