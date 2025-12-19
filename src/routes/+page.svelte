<script lang="ts">
  import { getCounter, incrementCounter } from "./data.remote";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { signIn, signOut, signUp } from "$lib/auth-client";

  let { data } = $props();

  let counterId = $state(data.counterId);
  let counterData = $state(data.counterData);

  const defaultTiming = {
    total: data.ssrTiming.total,
    backend: data.ssrTiming.backend,
    worker: data.ssrTiming.worker,
    durableObject: data.ssrTiming.durableObject,
    timestamp: data.ssrTimestamp,
  } as TimingData;

  // Initialize metrics with SSR timing on page load
  let metrics = $state({
    lastTiming: data.ssrTiming ? defaultTiming : null,
    history: data.ssrTiming ? [defaultTiming] : [],
    currentOperation: null as string | null,
    operationStartTime: 0,
  });

  let email = $state("");
  let password = $state("");
  let isLoading = $state(false);
  let isIncrementing = $state(false);

  // Performance metrics state
  type TimingData = {
    total: number;
    network?: number;
    backend?: number;
    worker?: number;
    durableObject?: number;
    timestamp: string;
  };

  function updateMetrics(timing: TimingData) {
    metrics.lastTiming = timing;
    metrics.history = [timing, ...metrics.history].slice(0, 20); // Keep last 20
  }

  function getAverageMetrics() {
    if (metrics.history.length === 0) return null;

    const totals = metrics.history.map((h) => h.total);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const sorted = [...totals].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index] || sorted[sorted.length - 1];

    return { avg, min, max, p95 };
  }

  async function handleSignIn() {
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!password.trim()) {
      alert("Password is required");
      return;
    }
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    isLoading = true;
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        alert(result.error.message);
        return;
      }
      email = "";
      password = "";
      await invalidateAll();
    } catch (error) {
      alert("Sign in failed: " + (error as Error).message);
    } finally {
      isLoading = false;
    }
  }

  async function handleSignUp() {
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!password.trim()) {
      alert("Password is required");
      return;
    }
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    isLoading = true;
    try {
      const result = await signUp.email({
        email,
        password,
        name: email.split("@")[0]
      });
      if (result.error) {
        alert(result.error.message);
        return;
      }
      email = "";
      password = "";
      await invalidateAll();
    } catch (error) {
      alert("Registration failed: " + (error as Error).message);
    } finally {
      isLoading = false;
    }
  }

  async function refresh() {
    const start = performance.now();
    metrics.currentOperation = "REFRESH";
    metrics.operationStartTime = start;

    counterData.count = 0;
    try {
      counterData = await getCounter(counterId);
      const end = performance.now();

      const timing: TimingData = {
        total: end - start,
        backend: (counterData as any).timing?.backend,
        worker: (counterData as any).timing?.worker,
        durableObject: (counterData as any).timing?.durableObject,
        timestamp: new Date().toISOString(),
      };
      updateMetrics(timing);
    } finally {
      metrics.currentOperation = null;
    }
  }

  async function increment() {
    if (!page.data.user) {
      alert("Please sign in to increment the counter");
      return;
    }

    const start = performance.now();
    metrics.currentOperation = "INCREMENT";
    metrics.operationStartTime = start;

    // Optimistic update
    const originalCount = counterData.count;
    counterData.count = originalCount + 1;
    counterData.timestamp = new Date().toISOString();

    isIncrementing = true;
    try {
      const networkStart = performance.now();
      counterData = await incrementCounter(counterId);
      const networkEnd = performance.now();
      const totalEnd = performance.now();

      const timing: TimingData = {
        total: totalEnd - start,
        network: networkEnd - networkStart,
        backend: (counterData as any).timing?.backend,
        worker: (counterData as any).timing?.worker,
        durableObject: (counterData as any).timing?.durableObject,
        timestamp: new Date().toISOString(),
      };
      updateMetrics(timing);
    } catch (error: unknown) {
      // Rollback optimistic update
      counterData.count = originalCount;
      const errorMsg = (error as Error).message;
      if (errorMsg.includes("sign in")) {
        alert("Please sign in to increment the counter");
      } else {
        alert("Failed to increment counter. Please try again.");
      }
    } finally {
      isIncrementing = false;
      metrics.currentOperation = null;
    }
  }
</script>

<svelte:head>
  <title>SVELTEKIT + BETTER AUTH + DURABLE OBJECTS</title>
</svelte:head>

<header class="relative bg-black text-white overflow-hidden">
  <!-- Animated Background -->
  <div class="absolute inset-0 opacity-20">
    <!-- Moving Grid Lines -->
    <svg
      class="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="white"
            stroke-width="1"
            opacity="0.3"
          />
        </pattern>
        <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="white" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>

    <!-- Animated Geometric Elements -->
    <div class="absolute inset-0">
      <!-- Moving diagonal lines -->
      <div class="absolute w-full h-full">
        <div
          class="absolute top-0 left-0 w-0.5 h-full bg-white opacity-40 animate-slide-right"
        ></div>
        <div
          class="absolute top-0 left-0 w-full h-0.5 bg-white opacity-30 animate-slide-down"
        ></div>
      </div>

      <!-- Floating geometric shapes -->
      <div
        class="absolute top-1/4 left-1/4 w-4 h-4 border border-white opacity-60 animate-float-1"
      ></div>
      <div
        class="absolute top-3/4 right-1/4 w-6 h-6 border border-white opacity-40 animate-float-2"
      ></div>
      <div
        class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white opacity-50 animate-pulse-slow"
      ></div>

      <!-- Scanning line effect -->
      <div
        class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-scan"
      ></div>
    </div>
  </div>

  <!-- Content overlay -->
  <div class="relative z-10 mx-auto max-w-2xl px-8 py-16">
    <div class="flex items-center gap-4 mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-terminal h-8 w-8"
        ><polyline points="4 17 10 11 4 5"></polyline><line
          x1="12"
          x2="20"
          y1="19"
          y2="19"
        ></line></svg
      ><a href="/" class="text-xl font-black">remote.coey.dev</a>
    </div>
    <h1 class="text-5xl font-black tracking-tight mb-6 leading-none">
      SVELTEKIT + BETTER AUTH + DURABLE OBJECTS
    </h1>
    <p class="text-lg font-medium mb-4 max-w-3xl">
      BAREBONES STARTER FOR AUTHENTICATED APPS WITH PERSISTENT STATE ON THE
      EDGE, USING CLOUDFLARE D1, DURABLE OBJECTS, BETTER AUTH, AND SVELTEKIT
      REMOTE FUNCTIONS.
    </p>
    <div
      class="bg-white/10 border border-white/20 rounded p-4 mb-8 max-w-3xl space-y-4"
    >
      <div class="text-sm font-mono text-white/90">
        Create your own project with this stack:
      </div>

      <div class="text-xl font-mono text-white/70 space-y-4">
        <div class="text-white font-bold">bun create remote-app my-app</div>
      </div>
    </div>
    <div class="flex gap-4">
      <a
        href="https://github.com/acoyfellow/remote"
        data-slot="button"
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 rounded-md has-[&gt;svg]:px-4 text-white border-white border-2 hover:bg-white hover:text-black font-black px-6 py-3 bg-transparent"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-code-xml mr-2 h-4 w-4"
          ><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path
            d="m14.5 4-5 16"
          ></path></svg
        >VIEW SOURCE</a
      >
    </div>
  </div>
</header>

<div class="relative p-4 overflow-hidden">
  <!-- Inverted Animated Background for Body -->
  <div class="absolute inset-0 opacity-15">
    <!-- Moving Grid Lines -->
    <svg
      class="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-body"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="black"
            stroke-width="1"
            opacity="0.4"
          />
        </pattern>
        <pattern
          id="dots-body"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="15" cy="15" r="1.5" fill="black" opacity="0.7" />
        </pattern>
        <pattern
          id="cross-body"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 18 L 20 22 M 18 20 L 22 20"
            stroke="black"
            stroke-width="1"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-body)" />
      <rect width="100%" height="100%" fill="url(#dots-body)" />
      <rect width="100%" height="100%" fill="url(#cross-body)" />
    </svg>

    <!-- Animated Geometric Elements -->
    <div class="absolute inset-0">
      <!-- Moving diagonal lines -->
      <div class="absolute w-full h-full">
        <div
          class="absolute top-0 left-0 w-0.5 h-full bg-black opacity-50 animate-slide-right"
        ></div>
        <div
          class="absolute top-0 left-0 w-full h-0.5 bg-black opacity-40 animate-slide-down"
        ></div>
        <!-- Additional crossing lines -->
        <div
          class="absolute top-0 right-0 w-0.5 h-full bg-black opacity-30 animate-slide-right"
          style="animation-delay: -4s;"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-full h-0.5 bg-black opacity-35 animate-slide-down"
          style="animation-delay: -6s;"
        ></div>
      </div>

      <!-- Floating geometric shapes -->
      <div
        class="absolute top-1/4 left-1/4 w-4 h-4 border border-black opacity-70 animate-float-1"
      ></div>
      <div
        class="absolute top-3/4 right-1/4 w-6 h-6 border border-black opacity-50 animate-float-2"
      ></div>
      <div
        class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-black opacity-60 animate-pulse-slow"
      ></div>

      <!-- Additional floating shapes -->
      <div
        class="absolute top-1/2 right-1/3 w-3 h-3 border-2 border-black opacity-55 animate-float-1"
        style="animation-delay: -2s;"
      ></div>
      <div
        class="absolute top-1/6 left-2/3 w-5 h-5 border border-black opacity-45 animate-float-2"
        style="animation-delay: -3s;"
      ></div>
      <div
        class="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-black opacity-65 animate-pulse-slow"
        style="animation-delay: -1s;"
      ></div>
      <div
        class="absolute top-2/3 left-1/6 w-4 h-1 bg-black opacity-40 animate-float-1"
        style="animation-delay: -5s;"
      ></div>

      <!-- Scanning line effects -->
      <div
        class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent opacity-90 animate-scan"
      ></div>
      <div
        class="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-black to-transparent opacity-70 animate-scan"
        style="animation-delay: -2s; animation-duration: 6s;"
      ></div>
    </div>
  </div>

  <div class="relative z-10 max-w-2xl mx-auto">
    <!-- AUTH -->
    <div class="border-4 border-black bg-white p-6 mb-4">
      <div class="text-lg font-bold uppercase mb-4">AUTH STATUS</div>

      {#if page.data.user}
        <div class="mb-4">
          <div class="text-sm font-mono mb-2">
            USER: {page.data.user.email || page.data.user.name}
          </div>
          <button
            onclick={async () => { await signOut(); await invalidateAll(); }}
            class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2"
          >
            SIGN OUT
          </button>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-2">
            <input
              type="email"
              placeholder="EMAIL"
              bind:value={email}
              class="border-4 border-black bg-white text-black font-medium font-mono focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_#000] px-4 py-3 text-sm focus:ring-0 hover:ring-2 hover:ring-black"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              bind:value={password}
              class="border-4 border-black bg-white text-black font-medium font-mono focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_#000] px-4 py-3 text-sm focus:ring-0 hover:ring-1 hover:ring-red-200"
            />
          </div>
          <div class="flex gap-2">
            <button
              onclick={handleSignIn}
              disabled={isLoading}
              class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2 flex-1"
            >
              {#if isLoading}
                SIGNING IN...
              {:else}
                SIGN IN
              {/if}
            </button>
            <button
              onclick={handleSignUp}
              disabled={isLoading}
              class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2 flex-1"
            >
              {#if isLoading}
                SIGNING UP...
              {:else}
                SIGN UP
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- COUNTER -->
    <div class="border-4 border-black bg-white p-6 mb-4">
      <div class="text-lg font-bold uppercase mb-4">DURABLE COUNTER</div>

      <div class="text-center mb-6">
        <div class="border-4 border-black inline-block p-8">
          <span class="text-6xl font-bold font-mono"
            >{counterData.count.toLocaleString()}</span
          >
        </div>
      </div>

      <div class="flex gap-2 mb-6">
        <button
          onclick={refresh}
          class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-3 flex-1"
        >
          REFRESH
        </button>
        <button
          onclick={increment}
          disabled={!page.data.user || isIncrementing}
          class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-3 flex-1"
        >
          {#if isIncrementing}
            {#if metrics.currentOperation && metrics.operationStartTime}
              INCREMENTING... {Math.round(
                performance.now() - metrics.operationStartTime
              )}MS
            {:else}
              INCREMENTING...
            {/if}
          {:else if !page.data.user}
            +1 (AUTH REQUIRED)
          {:else}
            +1 INCREMENT
          {/if}
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <div class="text-sm font-bold uppercase mb-2">INSTANCE</div>
          <select
            bind:value={counterId}
            oninput={async (e) => {
              const target = e.target as HTMLSelectElement;
              await goto(`?id=${target.value}`, { replaceState: true });
              refresh();
            }}
            class="border-4 border-black bg-white text-black font-semibold font-mono appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23000\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'4\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat pr-12 w-full px-4 py-3 text-sm"
          >
            <option value="default">DEFAULT</option>
            <option value="test">TEST</option>
            <option value="staging">STAGING</option>
            <option value="prod">PROD</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-bold uppercase mb-2">SSR LOAD</div>
            <div
              class="border-4 border-black p-3 text-center font-mono text-xs"
            >
              {new Date(data.ssrTimestamp).toISOString().slice(0, 19)}
            </div>
          </div>
          <div>
            <div class="text-sm font-bold uppercase mb-2">LAST UPDATE</div>
            <div
              class="border-4 border-black p-3 text-center font-mono text-xs"
            >
              {new Date(counterData.timestamp).toISOString().slice(0, 19)}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PERFORMANCE METRICS -->
    <div class="border-4 border-black bg-white p-6 mb-4">
      <div class="text-lg font-bold uppercase mb-4">PERFORMANCE METRICS</div>

      {#if metrics.lastTiming}
        <div class="mb-6">
          <div class="text-sm font-bold uppercase mb-2">
            {#if metrics.history.length === 1}
              INITIAL SSR LOAD
            {:else}
              LAST OPERATION
            {/if}
          </div>
          <div
            class="border-4 border-black bg-black text-white p-4 font-mono text-sm"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs opacity-70">TOTAL E2E</div>
                <div class="text-xl font-bold">
                  {Math.round(metrics.lastTiming.total)}MS
                </div>
              </div>
              {#if metrics.lastTiming.network}
                <div>
                  <div class="text-xs opacity-70">NETWORK</div>
                  <div class="text-xl font-bold">
                    {Math.round(metrics.lastTiming.network)}MS
                  </div>
                </div>
              {/if}
              {#if metrics.lastTiming.backend}
                <div>
                  <div class="text-xs opacity-70">BACKEND</div>
                  <div class="text-xl font-bold">
                    {Math.round(metrics.lastTiming.backend)}MS
                  </div>
                </div>
              {/if}
              {#if metrics.lastTiming.worker}
                <div>
                  <div class="text-xs opacity-70">WORKER</div>
                  <div class="text-xl font-bold">
                    {Math.round(metrics.lastTiming.worker)}MS
                  </div>
                </div>
              {/if}
              {#if metrics.lastTiming.durableObject}
                <div>
                  <div class="text-xs opacity-70">DURABLE OBJ</div>
                  <div class="text-xl font-bold">
                    {Math.round(metrics.lastTiming.durableObject)}MS
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      {#if getAverageMetrics()}
        {@const avgMetrics = getAverageMetrics()}
        {#if avgMetrics}
          <div class="mb-6">
            <div class="text-sm font-bold uppercase mb-2">
              ROLLING STATS (LAST {metrics.history.length})
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div class="border-4 border-black p-3 text-center">
                <div class="text-xs font-bold uppercase mb-1">AVG</div>
                <div class="text-lg font-mono font-bold">
                  {Math.round(avgMetrics.avg)}MS
                </div>
              </div>
              <div class="border-4 border-black p-3 text-center">
                <div class="text-xs font-bold uppercase mb-1">MIN</div>
                <div class="text-lg font-mono font-bold">
                  {Math.round(avgMetrics.min)}MS
                </div>
              </div>
              <div class="border-4 border-black p-3 text-center">
                <div class="text-xs font-bold uppercase mb-1">MAX</div>
                <div class="text-lg font-mono font-bold">
                  {Math.round(avgMetrics.max)}MS
                </div>
              </div>
              <div class="border-4 border-black p-3 text-center">
                <div class="text-xs font-bold uppercase mb-1">P95</div>
                <div class="text-lg font-mono font-bold">
                  {Math.round(avgMetrics.p95)}MS
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="py-16 relative z-10">
    <div class="mx-auto max-w-2xl px-8">
      <div class="mb-12">
        <h2 class="text-3xl font-white mb-2">STACK</h2>
        <div class="w-16 h-1 bg-white"></div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <a
          href="https://kit.svelte.dev"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          SVELTEKIT
        </a>
        <a
          href="https://www.better-auth.com"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          BETTER AUTH
        </a>
        <a
          href="https://developers.cloudflare.com/durable-objects"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          DURABLE OBJECTS
        </a>
        <a
          href="https://www.typescriptlang.org"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          TYPESCRIPT
        </a>
        <a
          href="https://orm.drizzle.team"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          DRIZZLE ORM
        </a>
        <a
          href="https://developers.cloudflare.com/d1"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          CLOUDFLARE D1
        </a>
        <a
          href="https://tailwindcss.com"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          TAILWIND
        </a>
        <a
          href="https://svelte.dev"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          SVELTE 5
        </a>
        <a
          href="https://alchemy.run"
          target="_blank"
          class="p-4 border-2 border-black bg-white text-center font-black hover:bg-black hover:text-white transition-none"
        >
          ALCHEMY
        </a>
      </div>
    </div>
  </div>
</div>
