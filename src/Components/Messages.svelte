<script lang="ts">
  import type { ChatFeed } from "../stores/Feeds/ChatFeed.svelte";
  import type { GroupChatFeed } from "../stores/Feeds/GroupChatFeed.svelte";
  import { ChatCache, type ChatMap, type GroupChatMap } from "../stores/caches/ChatCache.svelte";
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let {
    chats,
    chatId,
    bindId = $bindable(),
  }: { chats: string[]; chatId: string; bindId: string } = $props();

  const chatsStore = ChatCache.getCache();
  const usersInfoStore = UserInfosCache.getCache();

  let chatsMap : ChatMap = $state(chatsStore.chats);

  let chatsValues = $derived(() =>{
    let arr : ChatFeed [] = []
    chats.forEach(chatID => {
      if(chatsMap[chatID]) arr.push(chatsMap[chatID]! as ChatFeed);
    });
    return arr;
  });

  function stringToTimeDate(srtDate : string) : number{
    if(!srtDate) return Number.MAX_VALUE
    const values = srtDate.split(" ");
    const time = values[0].split(":");
    const date = values[1].split("/");

    return new Date(Number(date[2]), Number(date[1]), Number(date[0]), Number(time[0]), Number(time[1])).getTime();

  }

  const comparator = (a: ChatFeed | GroupChatFeed, b: ChatFeed | GroupChatFeed): number => {
    return (
      stringToTimeDate(b.chatInfo.timestamp) >= stringToTimeDate(a.chatInfo.timestamp) ? 1 : -1
    );
  };

  let orderedChats = $derived.by(() => {
    return chatsValues().sort(comparator)
  });


  $inspect("ordered Messages", orderedChats)

  
</script>

{#if chats}
  {#each orderedChats as chat}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- goto("/messages/"+chats[chatId]?.to -->
    <div
      class={chatId == chat.to! ? "usr-cnt active" : "usr-cnt"}
      onclick={() => {
        bindId = chat.to!;
        chatId = chat.to!;
        window.location.href =
          window.location.href.split("#")[0] + "#" + bindId;
      }}
    >
     {#await usersInfoStore.getUserInfo(chat!.to).waitForComplete() then userInfo}
        <div class="info">
          <ProfileIcon img={userInfo!.img} inRegistration={false} dimension={"medium"} groupIcon={false}/>
          <div class="chatInfo">
            <span>
              {userInfo!.Username}
            </span><br />
            <span class="flws">
              {chat?.chatInfo?.lastMessage.slice(
                0,
                10,
              )}{chat.chatInfo.lastMessage.length! > 10 ? "..." : ""}
              • {chat.chatInfo.timestamp.split(" ")[0]}
            </span>
          </div>
        </div>
      {/await}
    </div>
  {/each}
{:else}
    <LoadIcon />
{/if}

<style>
  .info {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .active {
    border-color: #21e3da !important;
    box-shadow: 0px 0px 10px #21e3da;
  }

  span {
    padding-left: 10px;
    font-size: 1.3em;
    vertical-align: middle;
  }

  .usr-cnt {
    margin: 10px;
    border: 1px solid gray;
    border-radius: 5px;
    padding: 10px 20px;
    width: calc(100% - 20px);
    background-color: rgba(255, 255, 255, 0.128);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    &:hover {
      border-color: #21e3da;
      cursor: pointer;
    }
  }

  .flws {
    color: rgba(255, 255, 255, 0.744);
    font-size: 1em;
  }

  @media (max-width: 1024px){
    .chatInfo{
      display: none;
    }
  }
</style>
