<script lang="ts">
  import "../app.css";
  import { authStore } from "$lib/auth-store.svelte";

  let { data, children } = $props();

  authStore.initialize(data.user, data.session);
</script>

{@render children?.()}
