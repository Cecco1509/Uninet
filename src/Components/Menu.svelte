<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import { signOut } from "firebase/auth";
  import ProfileIcon from "./ProfileIcon.svelte";
  import UserIcon from "./Icons/UserIcon.svelte";
  import HomeIcon from "./Icons/HomeIcon.svelte";
  import MessIcon from "./Icons/MessIcon.svelte";
  import UserGroup from "./Icons/UserGroup.svelte";
  import LogoutIcon from "./Icons/LogoutIcon.svelte";
  import BellIcon from "./Icons/BellIcon.svelte";
  import SearchIcon from "./Icons/SearchIcon.svelte";
  import { MenuStore, Positions } from "../stores/Menu.svelte";
  import Messages from "./Messages.svelte";
  import BoardIcon from "./Icons/boardIcon.svelte";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { PostCache } from "../stores/caches/PostCache.svelte";

  let { userID, page = $bindable() } : {userID : string; page : number} = $props();


  const menu = MenuStore.getMenu(page);
 
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      return;
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };

</script>

<div class={menu.currentSection == Positions.Messages || menu.currentSection == Positions.Volantini || menu.currentSection == Positions.MessGroups  ? "menu-container collapsed" : "menu-container"}>
  <button class={menu.currentSection == Positions.Feed ? "active" : ""} onclick={() => {goto("/feed"); }}>
    <!--menu.currentSection = Positions.Feed -->
    <HomeIcon/>
    <span class="btn-span">Home</span>
  </button>
  <button class={menu.currentSection == Positions.Volantini ? "active" : ""} onclick={() => {goto("/volantini"); }} >
    <!-- menu.currentSection = Positions.Volantini -->
    <BoardIcon />
    <span class="btn-span">Volantini</span>
  </button>
  <button class={menu.currentSection == Positions.Profile ? "active" : ""} onclick={() => {goto("/users/"+userID); }}>
    <!-- menu.currentSection = Positions.Profile -->
    <UserIcon/>
    <span class="btn-span">Profilo</span>
  </button>
  <button class={menu.currentSection == Positions.Search ? "active" : ""} onclick={() => {goto("/search"); }}>
    <!-- menu.currentSection = Positions.Search -->
    <SearchIcon/>
    <span class="btn-span">Ricerca</span>
  </button>
  <button class={menu.currentSection == Positions.Messages ? "active" : ""} onclick={() => {goto("/messages");}} > 
    <!-- menu.currentSection = Positions.Messages -->
    <MessIcon/>
    <span class="btn-span">Messaggi</span>
  </button>
  <button class={menu.currentSection == Positions.MessGroups ? "active" : ""} onclick={() => {goto("/studygroups");}} >
    <UserGroup/>
    <span class="btn-span">Gruppi</span>
  </button>
  <button onclick={handleSignOut}>
    <LogoutIcon/>
    <span class="btn-span">Logout</span>
  </button>
</div>

<div class={menu.currentSection == Positions.Messages || menu.currentSection == Positions.Volantini || menu.currentSection == Positions.MessGroups  ? "hidden" : "footer"}>
  <span>created with ❤️ by Lorenzo Ceccotti</span>
</div>


<style>

  .hidden{
    display: none;
  }

    .collapsed{
      padding: 10dvh 1dvh !important;
      transition: all 0.5s;
      width: fit-content !important;

      button{
        height: 50px;
        animation: collaps-btn 0.5s forwards;
      }


      .btn-span{
        display: none;
      }
    }

    @keyframes collaps-btn{
      0%{
        width: fit-content;
      }
      100%{
        width: 60px;
      }
    }

    @keyframes collaps{
      0%{
        padding: inherit;
        opacity: 1;
        width: 100%;
      }
      100%{
        opacity: 0;
        width: 0%;
        padding: 0px;
      }
    }

    .footer{
      position: fixed;
      bottom: 0px;
      left: 0px;
      width: 25dvw;
      padding: 0px 3dvw;
      color: rgba(255, 255, 255, 0.348);
    }

    .menu-container{
      display: flex;
      flex-direction: column;
      position: fixed;
      margin-top: 0;
      top: 0;
      left: 0;
      width: 25dvw;
      padding: 10dvh 0dvh 2dvh 4dvw;
      gap: 25px;
      transition: all 0.5s;
    }

    button{
      display: flex;
      justify-content: start;
      align-items: center;
      height: 50px;
      padding: 0px;
      margin: 0px;
      border: none;
      width: fit-content;
      background-color: transparent;
      fill: #ffffffb6;
      transition: all 0.3s;
      cursor: pointer;
      padding: 5px 10px;

      &:hover{
        fill: #ffffff;
        span{color: #ffffff;}
      }
    }

    .btn-span{
      transition: all 0.3s;
      font-size: 2em;
      padding: 0px 10px ;
      color: #ffffffb6;
      font-weight: 10;
    }

    .active{
      fill: #ffffff !important;
      /* transform: scale(1.15); */
      transition: all 0.3s;
      /* padding-left: 1.5dvw; */
      background-color: #ffffff20;
      border-radius: 5px;

      span{
        color: white;
      }
    }

</style>