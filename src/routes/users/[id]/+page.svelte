<script lang="ts">
  import { collection, onSnapshot } from "firebase/firestore";
  import User from "../../../Components/User.svelte";
  import { MyUser } from "../../../stores/userState.svelte";
  import { db } from "$lib/firebase/firebase.client";
  import Loading from "../../../Components/Loading.svelte";
  import { MenuStore, Positions } from "../../../stores/Menu.svelte";

  let { data } = $props();

  const userState = MyUser.getUser();
  MenuStore.getMenu().currentSection = Positions.Profile;
</script>

<svelte:head>
  <title>Uninet | User</title>
</svelte:head>

<!-- Menù a sinistra , meno importante-->

<!-- Icona bro, impotante-->

<!-- Followers&Seguiti -->

<!-- User Infos, importante -->

<div>
  <!-- User posts, impotante -->
  <!-- User thouths, impotante -->
</div>

<!-- Sezione voti a destra, meno importante(poi si fa)-->
{#if !userState.isLoading}
  <User username={data.id} />
{:else}
  <Loading />
{/if}
