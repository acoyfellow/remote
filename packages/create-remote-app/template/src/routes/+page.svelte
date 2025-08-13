<script lang="ts">
  import { authStore } from "$lib/auth-store.svelte";

  let email = $state("");
  let password = $state("");

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      alert("Email and password are required");
      return;
    }

    try {
      await authStore.signIn(email, password);
      email = "";
      password = "";
    } catch (error) {
      alert("Sign in failed: " + (error as Error).message);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim()) {
      alert("Email and password are required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await authStore.signUp(email, password);
      email = "";
      password = "";
    } catch (error) {
      alert("Sign up failed: " + (error as Error).message);
    }
  }
</script>

<svelte:head>
  <title>Remote App</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
    <h1 class="text-2xl font-bold text-center mb-6">
      SvelteKit + Better Auth + Durable Objects
    </h1>

    {#if authStore.user}
      <!-- Authenticated state -->
      <div class="text-center">
        <p class="text-gray-600 mb-4">
          Welcome, {authStore.user.email}!
        </p>

        <div class="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <h2 class="font-semibold text-green-800 mb-2">✅ Setup Complete!</h2>
          <p class="text-sm text-green-700">
            Your app is working with authentication. Now you can:
          </p>
          <ul class="text-sm text-green-700 mt-2 text-left">
            <li>
              • Add remote functions in <code>src/routes/data.remote.ts</code>
            </li>
            <li>
              • Customize your Durable Object in <code>worker/index.ts</code>
            </li>
            <li>• Update <code>alchemy.run.ts</code> with your DO names</li>
          </ul>
        </div>

        <button
          onclick={() => authStore.signOut()}
          class="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
    {:else}
      <!-- Unauthenticated state -->
      <form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <input
            id="email"
            type="email"
            bind:value={email}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            id="password"
            type="password"
            bind:value={password}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div class="flex space-x-2">
          <button
            type="button"
            onclick={handleSignIn}
            disabled={authStore.isLoading}
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {authStore.isLoading ? "Loading..." : "Sign In"}
          </button>

          <button
            type="button"
            onclick={handleSignUp}
            disabled={authStore.isLoading}
            class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {authStore.isLoading ? "Loading..." : "Sign Up"}
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>Create an account or sign in to test authentication</p>
      </div>
    {/if}
  </div>
</div>
