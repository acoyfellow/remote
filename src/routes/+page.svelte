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

<div class="min-h-screen bg-white p-4">
  <div class="max-w-2xl mx-auto">
    <!-- HEADER -->
    <div class="brutalist-card p-6 mb-4">
      <h1 class="text-3xl font-bold uppercase tracking-wider">
        SVELTEKIT + BETTER AUTH + DURABLE OBJECTS
      </h1>
    </div>

    <!-- AUTH -->
    <div class="brutalist-card p-6 mb-4">
      <div class="text-lg font-bold uppercase mb-4">AUTH STATUS</div>
      
      {#if authStore.user}
        <div class="mb-4">
          <div class="text-sm font-mono mb-2">USER: {authStore.user.email || authStore.user.name}</div>
          <button onclick={() => authStore.signOut()} class="brutalist-button px-4 py-2">
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
              class="brutalist-input px-4 py-3 font-mono text-sm"
            />
            <input
              type="email"
              placeholder="EMAIL"
              bind:value={email}
              class="brutalist-input px-4 py-3 font-mono text-sm"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              bind:value={password}
              class="brutalist-input px-4 py-3 font-mono text-sm"
            />
          </div>
          <div class="flex gap-2">
            <button onclick={handleSignIn} class="brutalist-button px-4 py-2 flex-1">
              SIGN IN
            </button>
            <button onclick={handleSignUp} class="brutalist-button px-4 py-2 flex-1">
              SIGN UP
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- COUNTER -->
    <div class="brutalist-card p-6 mb-4"
    class:hidden={!authStore.user}>
      <div class="text-lg font-bold uppercase mb-4">DURABLE COUNTER</div>
      
      <div class="text-center mb-6">
        <div class="brutalist-border inline-block p-8">
          <span class="text-6xl font-bold font-mono">{counterData.count}</span>
        </div>
      </div>

      <div class="flex gap-2 mb-6">
        <button onclick={refresh} class="brutalist-button px-4 py-3 flex-1">
          REFRESH
        </button>
        <button 
          onclick={increment} 
          class="brutalist-button px-4 py-3 flex-1"
          disabled={!authStore.user}
        >
          {#if authStore.user}
            INCREMENT
          {:else}
            AUTH REQUIRED
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
            class="brutalist-select w-full px-4 py-3 font-mono text-sm"
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
            <div class="brutalist-border p-3 text-center font-mono text-xs">
              {new Date(data.ssrTimestamp).toISOString().slice(0, 19)}
            </div>
          </div>
          <div>
            <div class="text-sm font-bold uppercase mb-2">LAST UPDATE</div>
            <div class="brutalist-border p-3 text-center font-mono text-xs">
              {new Date(counterData.timestamp).toISOString().slice(0, 19)}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
