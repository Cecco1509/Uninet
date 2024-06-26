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
  import type { GroupChatFeed } from "../stores/Feeds/GroupChatFeed.svelte";
  import Message from "./Message.svelte";
  
  let { chatId } : { chatId: string } = $props();

  const chatsStore = ChatCache.getCache();
  const usersInfoStore = UserInfosCache.getCache();

  let text = $state("");
  let messagesBox = $state<HTMLDivElement>();
  let before : string = "";
  let times = 1;

  let chat = $derived<GroupChatFeed | undefined>(chatsStore.getGroupChat(chatId));
  // $effect(() => {
  //   // console.log("CHAT ID =>" + chatId);
  //   // chat = ;
  //   // if (!chat) {
  //   //   chat = new Chat("", chatId, { lastMessage: "", timestamp: "" });
  //   // }
  // });

  const printDate = (date: string): boolean => {
    console.log(before , date)
    if (date == before) return false;
    before = date;
    return true;
  };

  let membersDialog = $state<HTMLDivElement>();
    let isOpen = $state(false)

  function openPartecipantsDialog() {
    membersDialog!.style.display = "block";
    isOpen = true;
  }

  function closePartecipantsDialog() {
    membersDialog!.style.display = "none";
    isOpen = false;
  }
</script>
  
  
  <div id="chat">
    {#if chat}
    <div class="info">
        <div style="display: flex; align-items:center; gap:10px; width:90%">
          <ProfileIcon img={chat!.chatInfo.img!} inRegistration={false} dimension={"medium"}/>
          <button
            class="link-name"
            
          > <!-- onclick={() => {MenuStore.getMenu(null).currentSection = Positions.Profile; goto("/users/"+chat!.to)}} -->
            <span style="display: inline-block;">
              {chat.chatInfo.name}
            </span>
          </button>
        </div>
        {#await chat.getPartecipants()}
            <LoadIcon/>
        {:then partecipants} 
            
              <button class="show" style="margin-right: 10px;" onclick={membersDialog?.style.display != "block" ? openPartecipantsDialog : closePartecipantsDialog}>
                {#if !isOpen}
                  Partecipanti
                {:else}
                  Chiudi
                {/if}
              </button>
            
            <div class="fixed-scrollbar" in:fade bind:this={membersDialog}>
              {#each partecipants as member}
                <div class="scroll-bar-element">
                {#if usersInfoStore.getUserInfo(member.name, "GROUPCHAT").data}
                    <ProfileIcon img={usersInfoStore.getUserInfo(member.name, "GROUPCHAT")!.data!.img} inRegistration={false} dimension={"medium"}/>
                    <span class="link-name" onclick={() => goto("/users/"+member.name)}>{member.name}</span>
                    <!--{userInfo!.online}-->
                  {/if}
                </div>
              {/each}
            </div>
          
        {/await}
        
    </div>
    <div class="msgs-cnt" bind:this={messagesBox} >
      <div  class="inner">
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
            {#each chat.newMessages as message}
             {#if printDate(message.data.timestamp.split(" ")[1]) }  <!--  -->
              <div class="msg-cnt" in:fade>
                <div class="day">
                  {before}
                </div>
              </div>
              {/if}
              <Message {message} fade={true} />
            {/each}
            <!-- Vecchi messaggi -->
            {#each messages as message}
              {#if printDate(message.data.timestamp.split(" ")[1])}
                <div class="msg-cnt">
                  <div class="day">
                    {before}
                  </div>
                </div>
              {/if}
                <Message {message} fade={false}/>
            {/each}
            {#key chat.freshMessages}
              {#each chat.freshMessages as message}
                <Message {message} fade={false}/>
              {/each}
            {/key}
            
          {/await}
      </div>
    </div>
    
    <form class="text-box">
      <input type="text" bind:value={text} />
      <button onclick={() => {if(!text) return; chat!.send(text); text = ""; before = ""}}> Invia </button>
    </form>
    {/if}
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

    .show{
      cursor: pointer;
      margin-left: 10px;
      border: none;
      border-radius: 5px;
      background-color: transparent;
      color: white;
      width: auto;
      padding: 8px;
      transition: all 0.3s;
      font-size: 1.3em;
      background-color: #e6c96022;

      &:hover {
        background-color: #e6c9605c;
      }
    }

    .fixed-scrollbar{
      position: fixed;
      height: 500px;
      width: 300px;
      overflow-y: auto;
      z-index: 20;
      display: none;
      top: 80px;
      right: 0px;

      animation: grow 1s forwards;
    }

    @keyframes grow{
      0%{
        height: 0px;
      }
      100%{
        height: 500px;
      }
    }

    .scroll-bar-element{
      width: 100%;
      border-bottom : 1px solid black;
      height: 100px;
      background-color: rgb(48, 48, 48);
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3em;
    }
  </style>
  