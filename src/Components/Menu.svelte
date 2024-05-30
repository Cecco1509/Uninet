<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import { signOut } from "firebase/auth";

  let { userID } : {userID : string;} = $props();

  const onUserPage = window.location.href == "/users" ? true : false;
 
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      goto("/");
      return;
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };

</script>


<div class="menu-container">
    <button class={onUserPage ? "" : "active"} onclick={() => goto("/feed")}>Home</button>
    <button class={onUserPage ? "active" : ""} onclick={() => goto("/users/"+userID)}>Profilo</button>
    <button onclick={handleSignOut}>Logout</button>
    <button>{window.location.pathname}</button>
</div>


<style>

    .menu-container{
        display: flex;
        flex-direction: column;
        position: fixed;
        margin-top: 0;
        top: 0;
        left: 0;
        width: 20vw;

        button{
            font-size: 2em;
            margin: 0px;
        }

        .active{
            background-color: blue;
            border: 0px solid black;
            font-size: 2em;
        }

    }

</style>