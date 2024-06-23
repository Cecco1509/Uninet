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

  const userState = MyUser.getUser();
  let menu = MenuStore.getMenu();
  let loading = $state(true)

  let { children } = $props();

  $effect(() => {
    //console.log(userState.user, userState.userInfo);
    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      window.location.pathname == "/"
    ) {
      if (userState.userInfo) {
        goto("/feed");
        menu.currentSection = Positions.Feed;
        loading = false;
      }else{
        Positions.Registration;
        loading = false;
      }
    }

    if (
      browser &&
      !userState.user &&
      !userState.isLoading &&
      window.location.pathname !== "/"
    ) {
      goto("/");
      menu.currentSection = Positions.Login;
      loading = false;
    }

    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      !userState.userInfo &&
      window.location.pathname !== "/"
    ) {
      goto("/");
      menu.currentSection = Positions.Registration;
      loading = false;
    }

    if (
      browser &&
      userState.user &&
      !userState.isLoading &&
      userState.userInfo
    ){
      loading = false
    }

    loading  = false;
  });

  $inspect(menu.currentSection);

  $effect(() => {
    menu.currentSection = MenuStore.toPosition(
      window.location.pathname.split("/")[1],
    );
  });

  // $effect(() => {
  //   if (!("Notification" in window)) {
  //     alert("This browser does not support desktop notification");
  //   }else if (Notification.permission === "granted") {
  //     var notification = new Notification( "Hello!", {
  //       lang : "it",
  //       body: "Testo della notifica", //200ms pausa, 200ms, image: 'imgurl',
  //       } );

  //   } else if (Notification.permission !== "denied") {

  //     Notification.requestPermission().then((permission) => {
  //       if (permission === "granted") {
  //         const notification = new Notification("Hi there!", {body : "ciao", icon: "", requireInteraction: true});
  //         notification.close();
  //       }
  //     });
  //   }
  // })
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
    class={menu.currentSection == Positions.Messages || menu.currentSection == Positions.Volantini
        ? "content-container plus"
        : "content-container"}
    >
      {@render children()}
    </div>
  {/if}
  
  <!-- <footer>
      <span>Uninet | Created with ❤️ by Lorenzo Ceccotti</span>
    </footer> -->
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
    background-color: rgba(128, 128, 128, 0.102);
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
