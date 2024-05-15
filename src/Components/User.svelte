<script lang="ts">
  import Loading from "../Components/Loading.svelte";
  import { getUserInfo } from "../stores/userInfo.svelte";
  import { createUser } from "../stores/userState.svelte";
  import { signOut } from "firebase/auth";
  import { auth } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";

  let { userId } = $props<{ userId: string }>();

  const userInfo = getUserInfo(userId);
  const userState = createUser();

  let email = $state<string | null | undefined>();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (e) {
      console.log((e as FirebaseError).code);
    }
  };
</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

<div class="user-info-box">
  <div class="top-wrapper">
    <ProfileIcon img={userInfo.data?.img} />
    {#if userInfo}
      <div class="top-info">
        <div class="number-wrapper">
          <span class="number">{userInfo.data?.Followers}</span><span
            >Posts</span
          >
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo.data?.Followers}</span><span
            >Followers</span
          >
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo.data?.seguiti}</span><span
            >Seguiti</span
          >
        </div>
      </div>
    {:else}
      <LoadIcon />
    {/if}
  </div>
  <br />
  <div class="bottom-info">
    <span class="big-text">{userInfo.data?.Nome}</span>
    <span class="big-text">{userInfo.data?.Cognome}</span>
    <br />
    <span class="highlight">@{userInfo.data?.Username}</span>
    <br /><br />
    <p>{userInfo.data?.Bio}</p>
  </div>
</div>

<!-- <div>
  <h1>CURRENT USER: {userInfo.data?.Nome}</h1>
  <button onclick={handleSignOut}>Logout</button>
</div> -->
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
