<script lang="ts">
  import { signOut } from "firebase/auth";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import { getUserInfo, getUserPosts } from "../stores/db";
  import Posts from "./Posts.svelte";

  let { username, userInfo } : { username: string; userInfo: UserInfo } = $props();

  let user = $state<UserInfo>();
  let offset = 0;
  let userPosts = $state<PostSchema[]>([]);
  let atEnd = $state(false);
  let fetchedAll = false;

  $effect(() => {
    if (!atEnd || fetchedAll) return;
    offset += 10;
    getUserPosts(username, userPosts[userPosts.length - 1]).then(
      (result: { posts: PostSchema[]; fetchedAll: boolean }) => {
        console.log(result.posts, result.fetchedAll);
        userPosts = [...userPosts, ...result.posts];
        atEnd = false;
        fetchedAll = result.fetchedAll;
      },
    );
  });

  $effect(() => {
    if (!username || !userInfo) return;

    if (username !== userInfo.Username) {
      getUserInfo(username)
        .then((u) => {
          if (!u) window.location.href = "/feed";
          user = u;
        })
        .catch((e) => {
          console.log("errore: ", e);
        });
    } else {
      user = userInfo;
    }
  });

  $effect(() => {
    if (!user) return;

    getUserPosts(user!.Username, null)
      .then((result: { posts: PostSchema[]; fetchedAll: boolean }) => {
        userPosts = [...userPosts, ...result.posts];
        atEnd = result.fetchedAll;
      })
      .catch((e) => {
        console.log(e);
      });
  });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
      return;
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };
</script>

<svelte:head>
  <title>Uninet | {user?.Username}</title>
</svelte:head>

<div class="user-info-box">
  <div class="top-wrapper">
    <ProfileIcon img={user?.img ? user.img : null} />
    {#if user}
      <div class="top-info">
        <div class="number-wrapper">
          <span class="number">{user?.Followers}</span><span>Posts</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{user?.seguiti}</span><span>Followers</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{user?.seguiti}</span><span>Seguiti</span>
        </div>
      </div>
    {:else}
      <LoadIcon />
    {/if}
  </div>
  <br />
  <div class="bottom-info">
    <span class="big-text">{user?.Nome}</span>
    <span class="big-text">{user?.Cognome}</span>
    <br />
    <span class="highlight">@{user?.Username}</span>
    <br /><br />
    <p>{user?.Bio}</p>
  </div>
</div>
<div>
  <h1>CURRENT USER: {userInfo?.Username}</h1>
  <button onclick={handleSignOut}>Logout</button>
</div>

<Posts
  posts={userPosts}
  inUserPage={true}
  editable={username == userInfo?.Username}
  bind:atEnd
/>

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
