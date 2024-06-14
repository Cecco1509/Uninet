<script lang="ts">
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import { DataBasaConn } from "../stores/db.svelte";
  import Posts from "./Posts.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { goto } from "$app/navigation";
  import { ChatStore } from "../stores/ChatList.svelte";
  import type { Feed } from "../stores/Feed.svelte";
  import { Positions, MenuStore } from "../stores/Menu.svelte";

  let { username }: { username: string } = $props();

  const user = MyUser.getUser();
  const db = DataBasaConn.getDB();
  let userPosts = $state<Feed>();
  const chatStore = ChatStore.getChatStore();
  let userInfo = $state<UserInfo>();
  let showPost = $state(true);
  let reload = $state(false);

  $effect(() => {
    if (!username || user.isLoading) return;

    userPosts = db.getUserPosts(username);

    if (username !== user.userInfo?.Username) {
      db.getUserInfo(username)
        .then((u) => {
          userInfo = u;
        })
        .catch((e) => {
          console.log("errore: ", e);
        });
    } else {
      userInfo = user.userInfo;
    }
  });

  $inspect(userInfo)

  async function follow() {
    await user.follow(username);
    if (await user.isFriend(username)) userInfo!.Followers += 1;
    else userInfo!.Followers -= 1;

  }
</script>

<svelte:head>
  <title>Uninet | {userInfo?.Username}</title>
</svelte:head>

<div class="user-info-box">
  <div class="top-wrapper">
    {#key userInfo}
      {#if userInfo}
        <ProfileIcon img={userInfo?.img ? userInfo.img : null} inFeed={false} />
        <div class="top-info">
          <div class="number-wrapper">
            <span class="number">{userInfo.posts}</span><span>Posts</span>
          </div>
          <div class="number-wrapper">
            <span class="number">{userInfo.Followers}</span><span
              >Followers</span
            >
          </div>
          <div class="number-wrapper">
            <span class="number">{userInfo.seguiti}</span><span>Seguiti</span>
          </div>
        </div>
        <br />
      {:else}
        <LoadIcon />
      {/if}
    {/key}
  </div>

  <div class="bottom-info">
    <span class="big-text">{userInfo?.Nome}</span>
    <span class="big-text">{userInfo?.Cognome}</span>
    <br />
    <span class="highlight">@{userInfo?.Username}</span>
    <br /><br />
    <p>{userInfo?.Bio}</p>
  </div>
</div>
{#if !user.isLoading && user.userInfo?.Username != username}
  <button
    class="btn"
    onclick={() => {
      goto("/messages#" + username);
      MenuStore.getMenu(null).currentSection = Positions.Messages;
    }}
  >
    Scrivi
  </button>
  {#key reload}
    {#await user.isFriend(username)}
      <button class="btn"> <LoadIcon /> </button>
    {:then isFriend}
      {#if !isFriend}
        <button class="btn" onclick={follow}> segui </button>
      {:else}
        <button class="btn" onclick={follow}> seguito </button>
      {/if}
    {/await}
  {/key}
{/if}

<br />
<br />

<div class="choice-cnt">
  <span class={showPost ? "active" : ""}>Posts</span>
  <span class={showPost ? "" : "active"}>Volantini</span>
</div>

<hr />
{#if userPosts && showPost}
  <Posts
    feed={userPosts}
    inUserPage={true}
    editable={username == user.userInfo?.Username}
  />
{/if}

<style>
  .btn {
    padding: 7px 10px;
    border: none;
    border-radius: 5px;
    width: 100px;
    background-color: transparent;
    color: white;
    background-color: rgba(255, 255, 255, 0.119);
    cursor: pointer;
    font-size: 1.4em;
    transition: all 0.3s;
    margin: 20px;

    &:hover {
      background-color: #e6c960;
    }
  }

  .choice-cnt {
    display: flex;
    gap: 0px;
    transition: all 0.3s;

    span {
      opacity: 0.3;
      width: 50%;
      text-align: center;
      transition: all 0.3s;
      padding-bottom: 10px;
      font-size: 1.3em;
    }

    &:hover span {
      opacity: 0.3;
    }

    & span:hover {
      opacity: 1;
      outline: 0;
      cursor: pointer;
      border-bottom: 0.5px solid #21e3da;
    }

    .active {
      opacity: 1;
      outline: 0;
      cursor: pointer;
      border-bottom: 0.5px solid #21e3da;
    }
  }

  span {
    font-size: 1.3em;
  }

  .user-info-box {
    width: 100%;
    padding: 10px;
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
