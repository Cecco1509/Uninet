<script lang="ts">
  import type { Chat } from "../stores/Chat.svelte";
  import { ChatStore } from "../stores/ChatList.svelte";
  import { DataBasaConn } from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let {
    chats,
    chatId,
    bindId = $bindable(),
  }: { chats: string[]; chatId: string; bindId: string } = $props();

  let chatsMap : chatList = $state(ChatStore.getChatStore().chats);

  let chatsValues = $derived(() =>{
    let arr : Chat[] = []
    chats.forEach(chatID => {
      if(chatsMap[chatID]) arr.push(chatsMap[chatID]!)
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

  const comparator = (a: Chat, b: Chat): number => {
    return (
      stringToTimeDate(b?.chatInfo?.timestamp!) >= stringToTimeDate(a?.chatInfo?.timestamp!) ? 1 : -1
    );
  };

  let orderedChats = $derived.by(() => {
    return chatsValues().sort(comparator)
  });


  $inspect(orderedChats)

  
</script>

{#if chats}
  {#each orderedChats as chat}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- goto("/messages/"+chats[chatId]?.to -->
    <div
      class={chatId == chat.to ? "usr-cnt active" : "usr-cnt"}
      onclick={() => {
        bindId = chat.to!;
        chatId = chat.to!;
        window.location.href =
          window.location.href.split("#")[0] + "#" + bindId;
      }}
    >
      {#await DataBasaConn.getDB().getUserInfo(chat!.to)}
        <LoadIcon />
      {:then userInfo}
        <div class="info">
          <ProfileIcon img={userInfo!.img} inFeed={true} />
          <div>
            <span>
              {userInfo?.Username}
            </span><br />
            <span class="flws">
              {chat?.chatInfo?.lastMessage.slice(
                0,
                10,
              )}{chat?.chatInfo?.lastMessage.length! > 10 ? "..." : ""}
              • {chat?.chatInfo?.timestamp}
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
