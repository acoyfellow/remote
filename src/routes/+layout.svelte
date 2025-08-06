<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:boundary>
  {@render children?.()}
  {#snippet pending()}
    <p>loading...</p>
  {/snippet}
</svelte:boundary>
