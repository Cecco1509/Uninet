<script lang="ts">
  import Loading from "../../Components/Loading.svelte";
  import Registration from "../../Components/Registration.svelte";
  import { MenuStore, Positions } from "../../stores/Menu.svelte";
  import { MyUser } from "../../stores/userState.svelte";

  const userState = MyUser.getUser();
  MenuStore.getMenu().currentSection = Positions.Registration;
</script>

<svelte:head>
  <title>Uninet | Completa registrazione</title>
</svelte:head>

{#if !userState.isLoading}
  <Registration userID={userState.user!.uid} />
{:else}
  <Loading />
{/if}
