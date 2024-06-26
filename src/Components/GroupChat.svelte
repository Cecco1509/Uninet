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
  
    let chatsMap : GroupChatMap = $state(chatsStore.groupChats);
  
    let chatsValues = $derived(() =>{
      let arr : GroupChatFeed [] = []
      chats.forEach(chatID => {
        if(chatsMap[chatID]) arr.push(chatsMap[chatID]! as GroupChatFeed);
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
        class={chatId == chat.chatInfo.name! ? "usr-cnt active" : "usr-cnt"}
        onclick={() => {
          bindId = chat.chatInfo.name!;
          chatId = chat.chatInfo.name!;
          window.location.href =
            window.location.href.split("#")[0] + "#" + bindId;
        }}
      >
      <div class="info">
        <ProfileIcon img={chat.chatInfo!.img} inFeed={true} />
        <div>
          <span>
            {chat.chatInfo!.name}
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
  
    /* .empty-list{
          height: 100px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
      }
  
      button{
          cursor: pointer;
          margin-left: 10px;
          border: none;
          border-radius: 5px;
          background-color: transparent;
          color: white;
          width: auto;
          padding: 8px;
          transition: all 0.3s;
  
          &:hover{
              background-color: #e6c9605c;
  
          }
      } */
  
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
  </style>
  