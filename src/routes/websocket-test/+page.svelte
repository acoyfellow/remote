<script lang="ts">
  import { getRealtimeData } from "../data.remote";

  let data = $state<any>(null);
  let isPolling = $state(false);
  let intervalId: NodeJS.Timeout | null = null;

  async function startPolling() {
    if (isPolling) return;

    isPolling = true;

    const poll = async () => {
      try {
        data = await getRealtimeData();
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Initial fetch
    await poll();

    // Poll every 2 seconds
    intervalId = setInterval(poll, 2000);
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isPolling = false;
  }

  // Cleanup on destroy
  $effect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">WebSocket-like Polling Test</h1>

  <div class="space-y-4">
    <div class="flex gap-2">
      <button
        class="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        onclick={startPolling}
        disabled={isPolling}
      >
        Start Polling
      </button>

      <button
        class="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        onclick={stopPolling}
        disabled={!isPolling}
      >
        Stop Polling
      </button>
    </div>

    <div class="border p-4 rounded">
      <h2 class="text-lg font-semibold mb-2">Real-time Data:</h2>
      {#if data}
        <div class="space-y-1 text-sm font-mono">
          <p><strong>Server Time:</strong> {data.serverTime}</p>
          <p><strong>Random Value:</strong> {data.randomValue.toFixed(6)}</p>
          <p><strong>Timestamp:</strong> {data.timestamp}</p>
          <p><strong>Uptime:</strong> {data.uptime}s</p>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          Status: {isPolling ? "🟢 Polling active" : "🔴 Polling stopped"}
        </div>
      {:else}
        <p class="text-gray-500">
          No data yet - start polling to see real-time updates
        </p>
      {/if}
    </div>
  </div>
</div>
