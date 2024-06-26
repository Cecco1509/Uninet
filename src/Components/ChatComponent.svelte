<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { MenuStore, Positions } from "../stores/Menu.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import { ChatFeed } from "../stores/Feeds/ChatFeed.svelte";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";
  import { ChatQueryBuilder } from "../stores/QueryBuilders/ChatQueryBuilder";
  import MessageComponent from "./MessageComponent.svelte";
  import ChatFeedComponent from "./ChatFeedComponent.svelte";

  let { chatId } : { chatId: string } = $props();

  const chatsStore = ChatCache.getCache();
  const usersInfoStore = UserInfosCache.getCache();

  let text = $state("");
  let messagesBox = $state<HTMLDivElement>();
  let before : string[] = [];
  let posMap : {[key : number] : number} = {};

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

  const printDate = (date: string, i : number): boolean => {
    //console.log(before , date)
    if(before.length == 0){
      before.push(date);
      posMap[i] = 0;
      return true;
    }
    if(date != before[before.length-1]) {
      before.push(date);
      posMap[i] = before.length-1;
      return true
    }

    return false;
  };

  //let userInfo = $derived(usersInfoStore.getUserInfo(chat!.to, "CHAT").waitForComplete());
</script>


<div id="chat">
  <div class="info">
    {#await usersInfoStore.getUserInfo(chat!.to, "CHAT").waitForComplete() then userInfo}
      <ProfileIcon img={userInfo?.img ? userInfo.img : null} inRegistration={false} dimension={"medium"}/>
      <button
        class="link-name"
        onclick={() => {MenuStore.getMenu(null).currentSection = Positions.Profile; goto("/users/"+chat!.to)}}
      >
        <span>
          {userInfo?.Username}
        </span>
      </button>
    {/await }
  </div>
  <div class="msgs-cnt" bind:this={messagesBox} >
    <div  class="inner">
      {#if chat && chat.id != ""}
        <ChatFeedComponent {chat} />
        <!-- {#await chat.getElements()}
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
          <!-- Nuovi messaggi
          {#each {length : chat.newMessages.length} as _,i}
           {#if printDate(chat.newMessages[i].data.timestamp.split(" ")[1], i)}  
            <div class="msg-cnt" in:fade>
              <div class="day">
                {before[posMap[i]]}
              </div>
            </div>
            {/if}
            <MessageComponent message={chat.newMessages[i]} fade={true} />
          {/each}
          <!-- Vecchi messaggi
          {#each {length : messages.length} as _, i}
            {#if printDate(messages[i].data.timestamp.split(" ")[1], i)}
              <div class="msg-cnt">
                <div class="day">
                  {before[posMap[i]]}
                </div>
              </div>
            {/if}
            <MessageComponent message={messages[i]} fade={false}/>
          {/each}
           <!-- Messaggi appena arrivati e mandati
          {#each chat.freshMessages as message}
            <MessageComponent {message} fade={false}/>
          {/each}
        {/await} -->
      {/if}
    </div>
  </div>
  
  <form class="text-box">
    <input type="text" bind:value={text} />
    <button onclick={() => {if(!text) return; chat!.send(text); text = "";}}> Invia </button>
  </form>
  
</div>

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
    height: 80px;
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
    height: 60px;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 5px;
    display: flex;
    border-top: 1px solid #21e3da;
    z-index: 1; /* Ensure it appears above other content but not above scrollbar */
  }

  .msgs-cnt {
    width: 100%;
    height: calc(100dvh - 140px);
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


</style>
