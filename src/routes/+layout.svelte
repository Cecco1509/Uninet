<script lang="ts">
  import { auth } from "../lib/firebase/firebase.client";
  import { browser } from "$app/environment";
  import { authStore } from "../stores/authStore.svelte";

  let { children } = $props();

  $effect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user);

      authStore.currentUser = user;

      if (
        browser &&
        !authStore?.currentUser &&
        !authStore.isLoading &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/";
        //console.log(authStore.currentUser, authStore.isLoading);
      }
    });
    return unsubscribe;
  });
</script>

{@render children()}
