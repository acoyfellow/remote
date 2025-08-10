<script lang="ts">
  import { getCounter, incrementCounter } from "./data.remote";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/auth-store.svelte";

  let { data } = $props();

  let counterId = $state(data.counterId);
  let counterData = $state(data.counterData);

  let email = $state("");
  let password = $state("");
  let name = $state("");

  async function handleSignIn() {
    try {
      await authStore.signIn(email, password);
    } catch (error) {
      alert("AUTHENTICATION FAILED: " + (error as Error).message);
    }
  }

  async function handleSignUp() {
    try {
      await authStore.signUp(email, password, name);
    } catch (error) {
      alert("REGISTRATION FAILED: " + (error as Error).message);
    }
  }

  async function refresh() {
    counterData.count = 0;
    counterData = await getCounter(counterId);
  }

  async function increment() {
    counterData = await incrementCounter(counterId);
  }
</script>

<svelte:head>
  <title>SVELTEKIT + BETTER AUTH + DURABLE OBJECTS</title>
</svelte:head>

<div class="bg-black text-white">
  <div class="mx-auto max-w-2xl px-8 py-16">
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
    <p class="text-lg font-medium mb-8 max-w-3xl">
      BAREBONES STARTER FOR BUILDING AUTHENTICATED APPS WITH PERSISTENT STATE ON
      THE EDGE. UTILIZING CLOUDFLARE D1, DURABLE OBJECTS, AND BETTER AUTH, AND
      SVELTEKIT'S REMOTE FUNCTIONS.
    </p>
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
</div>

<div class="p-4">
  <div class="max-w-2xl mx-auto">
    <!-- AUTH -->
    <div class="border-4 border-black bg-white p-6 mb-4">
      <div class="text-lg font-bold uppercase mb-4">AUTH STATUS</div>

      {#if authStore.user}
        <div class="mb-4">
          <div class="text-sm font-mono mb-2">
            USER: {authStore.user.email || authStore.user.name}
          </div>
          <button
            onclick={() => authStore.signOut()}
            class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2"
          >
            SIGN OUT
          </button>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-2">
            <input
              type="text"
              placeholder="NAME"
              bind:value={name}
              class="border-4 border-black bg-white text-black font-medium font-mono focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_#000] px-4 py-3 text-sm"
            />
            <input
              type="email"
              placeholder="EMAIL"
              bind:value={email}
              class="border-4 border-black bg-white text-black font-medium font-mono focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_#000] px-4 py-3 text-sm"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              bind:value={password}
              class="border-4 border-black bg-white text-black font-medium font-mono focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_#000] px-4 py-3 text-sm"
            />
          </div>
          <div class="flex gap-2">
            <button
              onclick={handleSignIn}
              class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2 flex-1"
            >
              SIGN IN
            </button>
            <button
              onclick={handleSignUp}
              class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-2 flex-1"
            >
              SIGN UP
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
          <span class="text-6xl font-bold font-mono">{counterData.count}</span>
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
          class="border-4 border-black bg-white text-black font-bold uppercase tracking-wider transition-none cursor-pointer hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-gray-600 px-4 py-3 flex-1"
          disabled={!authStore.user}
        >
          +1 INCREMENT
          {#if !authStore.user}
            <span class="text-xs text-gray-500 block">AUTH REQUIRED</span>
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
  </div>
</div>

<div class="bg-gray-50 py-16">
  <div class="mx-auto max-w-2xl px-8">
    <div class="mb-12">
      <h2 class="text-3xl font-black mb-2">STACK</h2>
      <div class="w-16 h-1 bg-black"></div>
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
