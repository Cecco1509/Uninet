<script lang="ts">
  import { browser } from "$app/environment";
  import Loading from "../Components/Loading.svelte";
  import { MyUser} from "../stores/userState.svelte";
  import { goto } from "$app/navigation";

  const userState = MyUser.getUser();

  let { children } = $props();

  $effect(() => {
    //console.log(userState.user, userState.userInfo);
    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      window.location.pathname == "/"
    ) {
      if (userState.userInfo) goto("/feed");
      else goto("/users");
    }

    if (
      browser &&
      !userState.user &&
      !userState.isLoading &&
      window.location.pathname !== "/"
    ){
        goto("/");
    }
  });
</script>

{#if !userState.isLoading}
  {@render children()}
{:else}
  <Loading />
{/if}


