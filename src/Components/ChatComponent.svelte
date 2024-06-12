<script lang="ts">
  import { goto } from "$app/navigation";
  import { Chat } from "../stores/Chat.svelte";
  import { ChatStore } from "../stores/ChatList.svelte";
  import { MenuStore, Positions } from "../stores/Menu.svelte";
  import { DataBasaConn } from "../stores/db.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let { chatId }: { chatId: string } = $props();
  let text = $state("");
  let messagesBox = $state<HTMLDivElement>();
  let before = "";

  let chat = $derived<Chat | undefined>(
    ChatStore.getChatStore().getChat(chatId)
      ? ChatStore.getChatStore().getChat(chatId)
      : new Chat("", chatId, { timestamp: "", lastMessage: "" }),
  );
  // $effect(() => {
  //   // console.log("CHAT ID =>" + chatId);
  //   // chat = ;
  //   // if (!chat) {
  //   //   chat = new Chat("", chatId, { lastMessage: "", timestamp: "" });
  //   // }
  // });

  const printDate = (date: string): boolean => {
    if (date == before) return false;
    before = date;
    return true;
  };
</script>

<div class="info">
  {#await DataBasaConn.getDB().getUserInfo(chat!.to)}
    <LoadIcon />
  {:then userInfo}
    <ProfileIcon img={userInfo!.img} inFeed={true} />
    <button
      class="link-name"
      onclick={() => {MenuStore.getMenu(null).currentSection = Positions.Profile; goto("/users/"+chat!.to)}}
    >
      <span>
        {userInfo?.Username}
      </span>
    </button>
  {/await}
</div>
<div class="msgs-cnt" bind:this={messagesBox}>
  <div>
    {#if chat && chat.id != ""}
      {#each chat.messages as message}
        {#if printDate(message.timestamp?.split(" ")[1])}
          <div class="msg-cnt">
            <div class="day">
              {before}
            </div>
          </div>
        {/if}
        <div class="msg-cnt">
          <div
            class={message.sender == MyUser.getUser().userInfo?.Username
              ? "sended msg-box"
              : "received msg-box"}
          >
            <div class="msg-text">
              {message.text}
            </div>
            <div class="time">
              {message.timestamp?.split(" ")[0]}
            </div>
          </div>
        </div>
        <br />
      {/each}
    {:else if chat?.id == ""}
      NUOVA CHAT
    {/if}
  </div>
</div>

<form class="text-box">
  <input type="text" bind:value={text} />
  <button onclick={() => {chat!.send(text); text = ""}}> Invia </button>
</form>

<style>
  .link-name {
    border: none;
    background: transparent;
    color: white;
    width: auto;

    &:hover {
      background-color: transparent;
      text-decoration: underline;
      color: #e6c960;
    }
  }

  .info {
    width: 100%;
    height: 8dvh;
    position: relative; /* Change from fixed to relative */
    background-color: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid #21e3da;
    padding: 5px;
    z-index: 1; /* Ensure it appears above other content but not above scrollbar */
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  span {
    padding-left: 10px;
    font-size: 1.3em;
    vertical-align: middle;
  }

  .text-box {
    position: relative; /* Change from fixed to relative */
    width: 100%;
    height: 6.5dvh;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 5px;
    display: flex;
    border-top: 1px solid #21e3da;
    z-index: 1; /* Ensure it appears above other content but not above scrollbar */
  }

  .msgs-cnt {
    width: 100%;
    height: 85.5dvh;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px 0px;
  }

  input {
    height: auto;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.143);
    outline: none;
    border: 1px solid grey;
    border-radius: 25px;
    color: white;
    width: 100%;
    font-size: 1.2em;
    padding-left: 15px;
  }

  .msg-cnt {
    display: grid;
    width: 100%;
    padding: 10px;
    font-size: 1.1em;
  }

  button {
    border-radius: 25px;
    background-color: transparent;
    cursor: pointer;
    width: 100px;
    height: auto;
    border-color: #21e3da;
    border: 2px solid #21e3da;
    margin: 0px 5px;
    background-color: rgba(33, 227, 218, 0.1);
    /*font-size: 20px;       */
    color: #21e3da;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(33, 227, 217, 0.383);
    }
  }

  .msg-box {
    padding: 10px;
    width: 200px;
    border-radius: 15px;
    width: 40%;
    display: grid;
    border: 2px solid black;
  }

  .sended {
    background-color: #21e3d927;
    background-color: #21e3d989;
    border-color: #21e3da;
    justify-self: flex-end;
    padding-right: 20px;
  }

  .received {
    background-color: #ffffff23;
    border-color: #ffffff33;
    justify-self: flex-start;
  }

  .time {
    justify-self: flex-end;
  }

  .msg-text {
    width: 100%;
    padding-bottom: 5px;
  }

  .day {
    color: grey;
    justify-self: center;
    text-align: center;
    width: 100px;
    border: 1px solid grey;
    padding: 5px;
    border-radius: 5px;
    align-self: center;
  }
</style>
