<script lang="ts">
  import type { User } from "firebase/auth/web-extension";

  //import AuthReset from '../../components/AuthReset.svelte';
  import { auth } from "../../lib/firebase/firebase.client";
  import { authStore } from "../../stores/authStore.svelte";

  let email = $state<string | null | undefined>("");

  $effect(() => {
    email = authStore.currentUser?.email;
  });
</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

{#if email}
  <div>
    <h1>CURRENT USER: {email}</h1>
    <!-- <AuthReset /> -->
    <button onclick={authStore.logout}>Logout</button>
  </div>
{:else}
  <div>Loading...</div>
{/if}
