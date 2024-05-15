<script lang="ts">
  import { auth } from "../lib/firebase/firebase.client";
  import { browser } from "$app/environment";
  import Loading from "../Components/Loading.svelte";
  import { createUser } from "../stores/userState.svelte";

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

{#if userState.isLoading}
  <Loading />
{/if}
{@render children()}
