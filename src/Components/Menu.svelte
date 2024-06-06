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

  let { userID } : {userID : string;} = $props();

  let page = $state("");
 
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      goto("/");
      return;
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };

  $effect(() => {
    page = window.location.pathname.split("/")[1];
  })

  const handleClick = () => {

  }

</script>

<div class="menu-container">
    <button class={page == "feed" || page == "" ? "active" : ""} onclick={() => {goto("/feed"); page = "feed"}}>
      <div class="icon">
        <HomeIcon/>
      </div>
      <span class="btn-span">Home</span>
    </button>
    <button class={page == "users" ? "active" : ""} onclick={() => {goto("/users/"+userID); page = "users"}}>
      <div class="icon">
        <UserIcon/>
      </div>
      <span class="btn-span">Profilo</span>
    </button>
    <button class={page == "messages" ? "active" : ""} onclick={() => {goto("/messages"); page = "messages"}} >
      <div class="icon">
        <MessIcon/>
      </div>
      <span class="btn-span">Messaggi</span>
    </button>
    <button class={page == "workGrups" ? "active" : ""} >
      <div class="icon">
        <UserGroup/>
      </div>
      <span class="btn-span">Gruppi studio</span>
    </button>
    <button class={page == "notifiche" ? "active" : ""} >
      <div class="icon">
        <BellIcon/>
      </div>
      <span class="btn-span">Notifiche</span>
    </button>
    <button onclick={handleSignOut}>
      <div class="icon">
        <LogoutIcon/>
      </div>
      <span class="btn-span">Logout</span>
    </button>
</div>

<div class="footer">
  <span>created with ❤️ by Lorenzo Ceccotti</span>
</div>


<style>

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
      padding: 2dvw 7dvw 2dvw 3dvw;
      gap: 100px;
    }

    button{
      display: flex;
      justify-content: start;
      align-items: center;
      height: fit-content;
      height: 2dvh;
      padding: 0px;
      margin: 0px;
      border: none;
      width: fit-content;
      background-color: transparent;
      fill: #21e3d96a;
      transition: all 0.3s;
      cursor: pointer;

      &:hover{
        fill: #21e3d99f;
        span{color: #21e3d99f;}
      }
    }

    .btn-span{
      transition: all 0.3s;
      font-size: 2em;
      padding-left: 10px;
      color: #21e3d96a;
      font-weight: 10;
    }

    .active{
      fill: #21e3da;
      transform: scale(1.15);
      transition: all 0.3s;
      padding-left: 1.5dvw;

      span{
        color: #21e3da;
      }

      &:hover{
        fill: #21e3d9c7;
        span{color: #21e3d9c7;}
      }
    }

</style>