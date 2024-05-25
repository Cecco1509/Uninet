<script lang="ts">
  import Loading from "../../Components/Loading.svelte";
  import Registration from "../../Components/Registration.svelte";
  import { createUser } from "../../stores/userState.svelte";

  const userState = createUser();
</script>

<svelte:head>
  <title>Uninet | Completa registrazione</title>
</svelte:head>

{#if userState.user}
  <Registration userID={userState.user?.uid} />
{:else}
  <Loading />
{/if}
