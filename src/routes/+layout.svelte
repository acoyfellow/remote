<script lang="ts">
  import "../app.css";
  import { authStore } from "$lib/auth-store.svelte";
  import type { User, Session } from "$lib/schema";

  let { data, children } = $props();

  authStore.initialize(data.user as User, data.session as Session);
</script>

{@render children?.()}
