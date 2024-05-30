<script lang="ts">
  import { browser } from "$app/environment";
  import Loading from "../Components/Loading.svelte";
  import { MyUser} from "../stores/userState.svelte";
  import { goto } from "$app/navigation";
  import Menu from "../Components/Menu.svelte";

  const userState = MyUser.getUser();
  console.log("user created");

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
        window.location.href="/"
    }
  });
</script>
{#if !userState.isLoading}
  {#if userState.userInfo}
    <Menu userID={userState.userInfo!.Username} />
  {/if}
  <div class="content-container">
    {@render children()}
  </div>
  <footer>
    <span>Uninet | Created with ❤️ by Lorenzo Ceccotti</span>
  </footer>
{:else}
  <Loading />
{/if}

<style>

.content-container {
    min-height: 95svh;
    width: 60dvw;
    margin: 0px 20dvw;
    padding-top: 5vh;
    color: white;
}

footer {
    height: 5svh;
    width: 100dvw;
    left: 0px;
    color: white;
    background-color: transparent;
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 20dvw;
}

select,
input,
textarea,
button {
    font-size: inherit;
}

@media only screen and (max-width: 600px) {
    .content-container {
        margin: 0px 0px;
        width: 100%;
        padding: 0px 5dvw;
    }

    footer {
        display: none;
        padding-left: 5dvw;
    }
}
</style>



