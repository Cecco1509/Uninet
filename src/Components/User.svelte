<script lang="ts">
  import { signOut } from "firebase/auth";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import { DataBasaConn} from "../stores/db.svelte";
  import Posts from "./Posts.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { Post } from "../stores/Post.svelte";
  import { goto } from "$app/navigation";

  let { username } : { username: string}  = $props();

  const user = MyUser.getUser();
  const db = DataBasaConn.getDB();
  const userPosts = db.getUserPosts(user.userInfo!.Username);
  let userInfo = $state<UserInfo>();

  $effect(() => {
    if (!username || user.isLoading) return;

    if (username !== user.userInfo?.Username) {
      db.getUserInfo(username)
        .then((u) => {
          userInfo = u
        })
        .catch((e) => {
          console.log("errore: ", e);
        });
    } else {
      userInfo = user.userInfo;
    }
  });
</script>

<svelte:head>
  <title>Uninet | {userInfo?.Username}</title>
</svelte:head>

<div class="user-info-box">
  <div class="top-wrapper">
    {#if userInfo}
    <ProfileIcon img={userInfo?.img ? userInfo.img : null} />
      <div class="top-info">
        <div class="number-wrapper">
          <span class="number">{userInfo?.Followers}</span><span>Posts</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo?.seguiti}</span><span>Followers</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo?.seguiti}</span><span>Seguiti</span>
        </div>
      </div>
    <br />
    <div class="bottom-info">
      <span class="big-text">{userInfo?.Nome}</span>
      <span class="big-text">{userInfo?.Cognome}</span>
      <br />
      <span class="highlight">@{userInfo?.Username}</span>
      <br /><br />
      <p>{userInfo?.Bio}</p>
    </div>
    {:else}
      <LoadIcon />
      <p>{user.isLoading}</p>
    {/if}
</div>
</div>

{#if userPosts}
<Posts
  feed={userPosts}
  inUserPage={true}
  editable={username == userInfo?.Username}
/>
{/if}


<style>
  span {
    font-size: 1.3em;
  }

  .user-info-box {
    width: 100%;
    /* background-color: rgba(255, 255, 255, 0.3); */
  }

  .top-wrapper {
    display: flex;
  }

  .top-info {
    display: flex;
    padding: 0px 5%;
    justify-content: space-around;
    /* column-gap: 20%; */
    align-items: center;
    width: 100%;
  }

  .bottom-info {
    padding: 10px;
  }

  .big-text {
    font-size: 2.5em;
  }

  .highlight {
    font-size: 1.3em;
    color: #e6c960;
  }

  .number {
    font-size: 2.4em;
    text-align: center;
  }

  .number-wrapper {
    display: flex;
    flex-direction: column;
  }

  p {
    font-size: 1.1em;
    color: rgba(white, white, white, 0.6);
  }
</style>
