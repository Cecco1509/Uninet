<script lang="ts">
  import { browser } from "$app/environment";
  import Loading from "../Components/Loading.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { goto } from "$app/navigation";
  import { MenuStore, Positions } from "../stores/Menu.svelte";
  import Menu from "../Components/Menu.svelte";
  import PostComponent from "../Components/PostComponent.svelte";
  import User from "../Components/User.svelte";
  import firebase from "firebase/compat/app";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { ref } from "firebase/database";
  import { realtimeDB } from "$lib/firebase/firebase.client";

  const userState = MyUser.getUser();

  let menu = MenuStore.getMenu();
  let loading = $state(true)

  let { children } = $props();

  $effect(() => {
    
    if(MenuStore.getMenu().offline && !navigator.onLine) {
      loading= false;
      goto("/offline");
      return;
    }
    
    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      window.location.pathname == "/"
    ) {
      if (userState.userInfo) {
        ChatCache.getCache();
        goto("/feed")
        loading = false;
        return;
      }else{
        Positions.Registration;
        loading = false;
        return;
      }
    }

    if (
      browser &&
      !userState.user &&
      !userState.isLoading &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/"
      loading = false;
      return;
    }

    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      !userState.userInfo &&
      window.location.pathname !== "/"
    ) {
      //window.location.href = "/"
      menu.currentSection = Positions.Registration;
      loading = false;
      return;
    }

    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      userState.userInfo
    ){
      ChatCache.getCache();
      loading = false
      return;
    }

    loading = false;
  });

  $inspect(menu.currentSection);

  $effect(() => {
    menu.currentSection = MenuStore.toPosition(
      window.location.pathname.split("/")[1],
    );
  });

</script>

{#if !userState.isLoading && !loading}
  {#if userState.userInfo && menu.currentSection}
    <Menu userID={userState.userInfo!.Username} page={menu.currentSection} />
  {/if}

  {#if menu.currentSection == Positions.Login || menu.currentSection == Positions.Registration}
    <div class="content-container extended">
      {@render children()}
    </div>
  {:else if userState.userInfo}
    <div
    class={menu.currentSection == Positions.Messages || menu.currentSection == Positions.Volantini || menu.currentSection == Positions.MessGroups 
        ? "content-container plus"
        : "content-container"}
    >
      {@render children()}
    </div>
  {/if}
{:else}
  <Loading />
{/if}

<style>
  .content-container {
    min-height: 100dvh;
    width: 525px;
    margin: 0px 25dvw;
    color: white;
    border-left: 1px solid rgba(255, 255, 255, 0.201);
    border-right: 1px solid rgba(255, 255, 255, 0.201);
    background-color: rgb(0, 0, 0);
    transition: all 0.4s;
  }

  .extended{
    border: none;
    width: 70dvw;
    padding: 0px;
    margin: 0px 15dvw;
    display: grid;
    place-content: center;
  }

  .plus {
    transition: all 0.4s;
    padding: 0px !important;
    margin: 0px 0px 0px 80px !important;
    width: calc(100% - 80px);
    border: none;
    background-color: transparent !important;
  }

  @media only screen and (max-width: 600px) {
    .content-container {
      margin: 0px 0px;
      width: 100%;
      padding: 0px 10px;
    }
  }
</style>
