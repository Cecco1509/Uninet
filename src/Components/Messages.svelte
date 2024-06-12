<script lang="ts">
  import { DataBasaConn } from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let {
    chats,
    chatId,
    bindId = $bindable(),
  }: { chats: chatList; chatId: string; bindId: string } = $props();

  $effect(() => {
    console.log("cID", chatId, "bID", bindId);
  });

  const comparator = (a: string, b: string): number => {
    return (
      new Date(chats[b]?.chatInfo?.timestamp!).getTime() -
      new Date(chats[a]?.chatInfo?.timestamp!).getTime()
    );
  };
</script>

{#if chats}
  {#each Object.keys(chats).sort(comparator) as chatId_}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- goto("/messages/"+chats[chatId]?.to -->
    <div
      class={chatId == chatId_ ? "usr-cnt active" : "usr-cnt"}
      onclick={() => {
        bindId = chatId_;
        chatId = chatId_;
        window.location.href =
          window.location.href.split("#")[0] + "#" + bindId;
      }}
    >
      {#await DataBasaConn.getDB().getUserInfo(chats[chatId_]!.to)}
        <LoadIcon />
      {:then userInfo}
        <div class="info">
          <ProfileIcon img={userInfo!.img} inFeed={true} />
          <div>
            <span>
              {userInfo?.Username}
            </span><br />
            <span class="flws">
              {chats[chatId_]?.chatInfo?.lastMessage.slice(
                0,
                10,
              )}{chats[chatId_]?.chatInfo?.lastMessage.length! > 10 ? "..." : ""}
              • {chats[chatId_]?.chatInfo?.timestamp}
            </span>
          </div>
        </div>
      {/await}
    </div>
  {/each}
{/if}

<style>
  .info {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .active {
    border-color: #e6c9606a !important;
    box-shadow: 0px 0px 10px #e6c9606a;
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
    background-color: rgba(255, 255, 255, 0.086);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    &:hover {
      border-color: #e6c9606a;
      cursor: pointer;
    }
  }

  .flws {
    color: rgba(255, 255, 255, 0.744);
    font-size: 1em;
  }
</style>
