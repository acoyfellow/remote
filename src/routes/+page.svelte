<script lang="ts">
  import {
    getHello,
    testBindings,
    testSharedLogic,
    getRealtimeData,
    incrementCounter,
    getCounter,
  } from "./data.remote";

  // Test shared logic on client side
  const clientSharedLogic = (name: string) => {
    return `Processed: ${name.toUpperCase()} at ${new Date().toISOString()}`;
  };

  let counter = $state(0);

  async function handleIncrement() {
    try {
      const result = await incrementCounter();
      console.log("Increment result:", result);
      // Use the counter from the increment result instead of making another call
      counter = result.counter;
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  }
</script>

<div class="p-6 space-y-6">
  <h1 class="text-3xl font-bold">Remote Functions Test Lab</h1>

  <div class="mb-4">
    <a
      href="/durable-object"
      class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      🏗️ Durable Object Demo
    </a>
  </div>

  <!-- Test 1: Basic Hello -->
  <section class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">1. Basic Hello</h2>
    <p class="text-lg">{await getHello()}</p>
  </section>

  <!-- Test 2: Cloudflare Bindings -->
  <section class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">2. Cloudflare Bindings Access</h2>
    {#await testBindings()}
      <p>Checking bindings...</p>
    {:then bindings}
      <pre class="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(
          bindings,
          null,
          2
        )}</pre>
    {/await}
  </section>

  <!-- Test 3: Shared Logic -->
  <section class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">3. Shared Client/Server Logic</h2>
    <div class="space-y-2">
      <p><strong>Client:</strong> {clientSharedLogic("client")}</p>
      <p>
        <strong>Server Rendered:</strong>
        {#await testSharedLogic("server") then result}{result.serverResult}{/await}
      </p>
    </div>
  </section>

  <!-- Test 4: Dynamic Data -->
  <section class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">
      4. Dynamic Data (Changes Each Call)
    </h2>
    {#await getRealtimeData()}
      <p>Loading dynamic data...</p>
    {:then data}
      <div class="space-y-1 text-sm">
        <p><strong>Server Time:</strong> {data.serverTime}</p>
        <p><strong>Random Value:</strong> {data.randomValue.toFixed(4)}</p>
        <p><strong>Uptime:</strong> {data.uptime}s</p>
      </div>
      <button
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        onclick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    {/await}
  </section>

  <!-- Test 5: Server State -->
  <section class="border p-4 rounded">
    <h2 class="text-xl font-semibold mb-2">5. Server State Management</h2>
    <div class="space-y-2">
      <p>
        Current counter: {#await getCounter() then result}{result.counter}{/await}
      </p>
      <button
        class="px-4 py-2 bg-green-500 text-white rounded"
        onclick={handleIncrement}
      >
        Increment Counter
      </button>
    </div>
  </section>
</div>
