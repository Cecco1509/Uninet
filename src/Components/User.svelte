<script lang="ts">
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import { DataBasaConn} from "../stores/db.svelte";
  import Posts from "./Posts.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { goto } from "$app/navigation";
  import { ChatStore } from "../stores/ChatList.svelte";
  import type { Feed } from "../stores/Feed.svelte";

  let { username } : { username: string}  = $props();

  const user = MyUser.getUser();
  const db = DataBasaConn.getDB();
  let userPosts = $state<Feed>();
  const chatStore = ChatStore.getChatStote();
  let userInfo = $state<UserInfo>();
  let showPost = $state(true);

  $effect(() => {
    username;
    userPosts = db.getUserPosts(username);
  })

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

  async function goToChat(){
    let id = await chatStore.addChat(username)
    if(id) goto("/messages/"+id);
    else console.log("errore")
  }
</script>

<svelte:head>
  <title>Uninet | {userInfo?.Username}</title>
</svelte:head>

<div class="user-info-box">
  <div class="top-wrapper">
    {#if userInfo}
    <ProfileIcon img={userInfo?.img ? userInfo.img : null} inFeed={false} />
      <div class="top-info">
        <div class="number-wrapper">
          <span class="number">{userInfo.posts}</span><span>Posts</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo.Followers}</span><span>Followers</span>
        </div>
        <div class="number-wrapper">
          <span class="number">{userInfo.seguiti}</span><span>Seguiti</span>
        </div>
      </div>
    <br />
    {:else}
      <LoadIcon />
    {/if}
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
  <button onclick={async () => await goToChat()}> invia un messaggio </button>
  {#if !user.isFriend(username)}
    <button> segui </button>
  {/if}
{/if}

<br>
<br>
<hr>

<div class="choice-cnt">
  <h1 class={showPost ? "active" : ""}>Posts</h1>
  <h1 class={showPost ? "" : "active"}>Volantini</h1>
</div>


<hr>
{#if userPosts && showPost}
  <Posts
    feed={userPosts}
    inUserPage={true}
    editable={username == user.userInfo?.Username}
  />
{/if}


<style>

  .choice-cnt{
    display: flex;
    gap: 0px;

    h1{
      width: 50%;
      text-align: center;
      transition: all 0.5s;


      &:first-child{
        width: calc(50%);
        border-right: 1px solid rgb(51,51,51);
      }

      &:hover{
        background-color: #21e3d950;
        border-color: rgb(51,51,51);
        outline: 0;
        cursor: pointer;
      }
    }

    .active{
      background-color: #21e3d950;
      outline: 0;
      cursor: pointer;
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
