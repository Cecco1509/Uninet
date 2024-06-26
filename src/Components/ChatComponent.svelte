<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { MenuStore, Positions } from "../stores/Menu.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import { ChatFeed } from "../stores/Feeds/ChatFeed.svelte";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";
  import { Timestamp } from "firebase/firestore";
  import { ChatQueryBuilder } from "../stores/QueryBuilders/ChatQueryBuilder";
  import type { Message } from "../stores/FeedElements/Message.svelte";

  let { chatId }: { chatId: string } = $props();

  const chatsStore = ChatCache.getCache();
  const usersInfoStore = UserInfosCache.getCache();

  let text = $state("");
  let messagesBox = $state<HTMLDivElement>();
  let before : string[] = [];
  let times = 1;

  let chat = $derived<ChatFeed | undefined>(
    chatsStore.getChat(chatId)
      ? chatsStore.getChat(chatId)
      : new ChatFeed("", chatId, { timestamp: "", lastMessage: "" }),
  );
  // $effect(() => {
  //   // console.log("CHAT ID =>" + chatId);
  //   // chat = ;
  //   // if (!chat) {
  //   //   chat = new Chat("", chatId, { lastMessage: "", timestamp: "" });
  //   // }
  // });

  const printDate = (date: string, messageBefore : Message | undefined, i : number): boolean => {
    console.log(before , date)
    if(i == 0) return true;
    if(!messageBefore) return true;
    if(date ==  messageBefore.data.timestamp.split(" ")[1]) return false;
    return true;
  };

  let userInfo = usersInfoStore.getUserInfo(chat!.to, "CHAT").data;
</script>


<div id="chat">
  <div class="info">
    {#if userInfo }
      <ProfileIcon img={userInfo?.img ? userInfo.img : null} inRegistration={false} dimension={"medium"}/>
      <button
        class="link-name"
        onclick={() => {MenuStore.getMenu(null).currentSection = Positions.Profile; goto("/users/"+chat!.to)}}
      >
        <span>
          {userInfo?.Username}
        </span>
      </button>
    {/if}
  </div>
  <div class="msgs-cnt" bind:this={messagesBox} >
    <div  class="inner">
      {#if chat && chat.id != ""}
        {#await chat.getElements()}
        <div class="loading">
          <LoadIcon />
        </div>
        {:then messages}
          {#if !chat.fetchedAll}
            <div class="msg-cnt">
              <div class="day">
                <button class="load" onclick={
                  async () => 
                    { 
                        await chat.loadMore();
                        //setTimeout(() => messagesBox!.scrollBy({top : 600, behavior: "smooth"}), 1000);
                        //console.log(-100/times);
                        //messagesBox!.scrollTop = -900
                }}>
                  Carica
                </button>
              </div>
            </div>
          {/if}
          <!-- Nuovi messaggi -->
          {#each {length : chat.newMessages.length} as _,i}
           {#if printDate(chat.newMessages[i].data.timestamp.split(" ")[1],chat.newMessages[i-1], i)}  <!--  -->
            <div class="msg-cnt" in:fade>
              <div class="day">
                {chat.newMessages[i].data.timestamp.split(" ")[1]}
              </div>
            </div>
            {/if}
            <div class="msg-cnt fade">
              <div
                class={chat.newMessages[i].data.sender == MyUser.getUser().userInfo?.Username
                  ? "sended msg-box"
                  : "received msg-box"}
              >
                <div class="msg-text">
                  {chat.newMessages[i].data.text}
                </div>
                <div class="time">
                  {chat.newMessages[i].data.timestamp.split(" ")[0]}
                </div>
              </div>
            </div>
          {/each}
          <!-- Vecchi messaggi -->
          {#each {length : messages.length} as _, i}
            {#if printDate(messages[i].data.timestamp.split(" ")[1],messages[i-1], i)}
              <div class="msg-cnt">
                <div class="day">
                  {messages[i].data.timestamp.split(" ")[1]}
                </div>
              </div>
            {/if}
            <div class="msg-cnt">
              <div
                class={messages[i].data.sender == MyUser.getUser().userInfo?.Username
                  ? "sended msg-box"
                  : "received msg-box"}
              >
                <div class="msg-text">
                  {messages[i].data.text}
                </div>
                <div class="time">
                  {messages[i].data.timestamp.split(" ")[0]}
                </div>
              </div>
            </div>
          {/each}
        {/await}
      {/if}
    </div>
  </div>
  
  <form class="text-box">
    <input type="text" bind:value={text} />
    <button onclick={() => {if(!text) return; chat!.send(text); text = "";}}> Invia </button>
  </form>
  
</div>

<style>

  .loading{
    width: 100%;
    height: 100dvh;
  }

  .load{
    border: none;
    background: transparent;
    width: 100%;
    color: grey !important;
    margin: 0px;
    justify-self: center;
    text-align: center;
    font-size: 1.1em;

    &:hover {
      background-color: transparent;
    }
  }

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

  .inner{
    display: flex;
    flex-direction: column;
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

  .fade{
    animation: fade-in .5s forwards ease-in-out;
    transform: translateY(-5dvh);
  }

  @keyframes fade-in{
    0%{
      opacity: 0;
      transform: translateY(-5dvh);
    }
    100%{
      opacity: 1;
      transform: translateY(0dvh);
    }
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
    color: grey !important;
    justify-self: center;
    text-align: center;
    width: 100px;
    border: 1px solid grey;
    padding: 5px;
    border-radius: 5px;
    align-self: center;
  }
</style>
