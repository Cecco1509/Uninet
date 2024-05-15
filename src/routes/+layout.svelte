<script lang="ts">
  import { browser } from "$app/environment";
  import Loading from "../Components/Loading.svelte";
  import { createUser } from "../stores/userState.svelte";
  import LoadIcon from "../Components/LoadIcon.svelte";

  const userState = createUser();

  let { children } = $props();

  $effect(() => {
    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      window.location.pathname == "/"
    )
      window.location.href = "/feed";
  });
</script>

{#if !userState.user}
  <Loading />
{:else}
  {@render children()}
{/if}
