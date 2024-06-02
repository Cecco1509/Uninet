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

  {#if !userState.isLoading}
    {#if userState.userInfo}
      <Menu userID={userState.userInfo!.Username} />
    {/if}
    
    <div class="content-container">
      {@render children()}
    </div>
    <!-- <footer>
      <span>Uninet | Created with ❤️ by Lorenzo Ceccotti</span>
    </footer> -->
  {:else}
    <Loading />
  {/if}

<style>

.content-container {
    min-height: 95svh;
    width: 50dvw;
    margin: 0px 25dvw;
    color: white;
    border-left: 1px solid rgba(255, 255, 255, 0.201);
    border-right: 1px solid rgba(255, 255, 255, 0.201);
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



