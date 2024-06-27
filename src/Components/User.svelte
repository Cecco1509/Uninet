<script lang="ts">
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import Posts from "./Posts.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { goto } from "$app/navigation";
  import { Positions, MenuStore } from "../stores/Menu.svelte";
  import Loading from "./Loading.svelte";
  import { CacheVolantini } from "../stores/caches/CacheVolantini.svelte";
  import Volantini from "./Volantini.svelte";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { PostCache } from "../stores/caches/PostCache.svelte";
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";

  let { username }: { username: string } = $props();

  const user = MyUser.getUser();
  const postStore = PostCache.getCache();
  const userInfosStore = UserInfosCache.getCache();
  const volantiniStore = CacheVolantini.getCache()
  const chatStore = ChatCache.getCache();

  let userInfo = $state<UserInfo>();
  let showPost = $state(true);
  let reload = $state(false);

  let userPosts = $state(postStore.getUserFeed(username));
  let cacheVolantini = $state(CacheVolantini.getCache().getUserFeed(username));

  $effect(() => {
    if (!username || user.isLoading) return;

    //userPosts = userInfosStore.getUserPosts(username);

    if (username !== user.userInfo?.Username) {
      userInfo = userInfosStore.getUserInfo(username, "USERPAGE").data;
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
        <ProfileIcon img={userInfo?.img ? userInfo.img : null} inRegistration={false} dimension={"big"} groupIcon={false}/>
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
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span class={showPost ? "active" : ""} onclick={() => showPost = true}>Posts</span>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span class={showPost ? "" : "active"} onclick={() => showPost = false}>Volantini</span>
</div>

<hr />
{#if userPosts && showPost}
  <Posts
    feed={userPosts}
    inUserPage={true}
    editable={username == user.userInfo?.Username}
  />
{:else if !showPost}
  <Volantini
    feed = {cacheVolantini}
    inUserPage={true}
    editable={username == user.userInfo?.Username}
  ></Volantini>
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
