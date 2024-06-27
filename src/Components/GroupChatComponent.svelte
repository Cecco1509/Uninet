<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import { ChatCache } from "../stores/caches/ChatCache.svelte";
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";
  import MessageComponent from "./MessageComponent.svelte";
  import ChatFeedComponent from "./ChatFeedComponent.svelte";

  let { chatId } : { chatId: string } = $props();

  let text = $state("");
  let messagesBox = $state<HTMLDivElement>();

  const chatsStore = ChatCache.getCache();
  const usersInfoStore = UserInfosCache.getCache();

  let chat = $derived(chatsStore.getGroupChat(chatId));

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
    <div class="info">
      {#if chat}
        <div style="display: flex; align-items:center; gap:10px; width:90%">
          {#key chat}
            <ProfileIcon img={chat!.chatInfo.img!} inRegistration={false} dimension={"medium"} groupIcon={true}/>
          {/key}
          
          <button
            class="link-name"
            
          > <!-- onclick={() => {MenuStore.getMenu(null).currentSection = Positions.Profile; goto("/users/"+chat!.to)}} -->
            <span style="display: inline-block;">
              {chat!.chatInfo.name}
            </span>
          </button>
        </div>
         {#await chat!.getPartecipants()}
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
                {#await usersInfoStore.getUserInfo(member.name, "GROUPCHAT").waitForComplete() then info} 
                    <ProfileIcon img={info!.img} inRegistration={false} dimension={"medium"} groupIcon={false}/>
                    <button class="link-name" onclick={() => goto("/users/"+member.name)}>{member.name}</button>
                {/await}
                    
                </div>
              {/each}
            </div>
          
        {/await}
      {/if}
    </div>
    <div class="msgs-cnt" bind:this={messagesBox} >
      <div  class="inner">
        {#if chat}
          <ChatFeedComponent {chat} />
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
  