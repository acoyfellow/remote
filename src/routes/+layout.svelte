<script lang="ts">
  import "../app.css";
  import { authStore } from "$lib/auth-store.svelte";
  import { onMount } from "svelte";

  let { data, children, ...rest } = $props();

  authStore.initialize(data.user, data.session);
</script>

{@render children?.()}
