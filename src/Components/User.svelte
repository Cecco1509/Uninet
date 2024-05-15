<script lang="ts">
  import Loading from "../Components/Loading.svelte";
  import { getUserInfo } from "../stores/userInfo.svelte";
  import { createUser } from "../stores/userState.svelte";
  import { signOut } from "firebase/auth";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";

  let { userId } = $props<{ userId: string }>();

  const userInfo = getUserInfo(userId);
  const userState = createUser();

  let email = $state<string | null | undefined>();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };
</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

{#if userState.user}
  <div>
    <h1>CURRENT USER: {userInfo.data?.Nome}</h1>
    <button onclick={handleSignOut}>Logout</button>
  </div>
{/if}
