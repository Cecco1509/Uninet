<script lang="ts">
  import { collection, onSnapshot } from "firebase/firestore";
  import User from "../../../Components/User.svelte";
  import { createUser } from "../../../stores/userState.svelte";
  import { db } from "$lib/firebase/firebase.client";
  import Loading from "../../../Components/Loading.svelte";

  let { data } = $props();

  const userState = createUser();
  let postsArr = $state<PostSchema[]>([]);

  $effect(() => {
    const unsubscribe = onSnapshot(collection(db, "Posts"), (queryDocs) => {
      postsArr = [];
      queryDocs.forEach((doc) => {
        postsArr.push(doc.data() as PostSchema);
      });
    });
    return unsubscribe;
  });
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
{#if userState.user}
  <User username={data.id} userInfo={userState.userInfo} />
{:else}
  <Loading />
{/if}
