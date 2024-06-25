<script lang="ts">
    import {
      limitToFirst,
      onValue,
      query,
      ref,
      startAfter,
    } from "firebase/database";
    import Messages from "../../Components/Messages.svelte";
    import { MyUser } from "../../stores/userState.svelte";
    import { realtimeDB } from "$lib/firebase/firebase.client";
    import { set } from "firebase/database";
    import { uuidv4 } from "@firebase/util";
    import ChatComponent from "../../Components/ChatComponent.svelte";
    import { UserInfosCache } from "../../stores/caches/UserInfosCache.svelte";
    import { ChatCache } from "../../stores/caches/ChatCache.svelte";
    import { MenuStore, Positions } from "../../stores/Menu.svelte";
  
    const userState = MyUser.getUser();
    const db = UserInfosCache.getCache();
    let chatStore = ChatCache.getCache();
    let searchUser = $state<string>("");
    let bindId = $state("");
    let chatId = $state("");
  
    MenuStore.getMenu().currentSection = Positions.Messages;
  
  
    let messagesList = $derived(
      Object.keys(chatStore.chats).filter((chatId) => {
        return chatId.includes(searchUser)
      }
    ))
  
    $inspect(messagesList);
  
    const handleChange = function () {};
  
    $effect(() => {
      chatId = window.location.href.split("#")[1];
      if (chatId == "") chatId = bindId;
      //if(chatId == selectedChat) return
    });
  </script>
  
  <div class="cnt">
    <div class="msgs-cnt">
      <form autocomplete="off">
        <input
          autocomplete="off"
          type="search"
          bind:value={searchUser}
          onkeyup={handleChange}
          placeholder="Cerca per username"
        />
      </form>
  
      <Messages chats={messagesList} {chatId} bind:bindId />
    </div>
    <div class="cht-cnt">
      {#if !bindId && !chatId}
        <div class="nothing">
          <span>Seleziona una chat</span>
        </div>
      {:else if !bindId && chatId}
        <ChatComponent {chatId} />
      {:else}
        <ChatComponent chatId={bindId} />
      {/if}
    </div>
  </div>
  
  <style>
  
    .nothing{
      display: grid;
      place-content: center;
      width: 100%;
      height: 100%;
  
      span{
        color: rgba(255, 255, 255, 0.74);
      }
    }
  
    .cht-cnt {
      width: 100%;
      height: 100dvh;
    }
  
    span {
      font-size: 1.4em;
    }
  
    .cnt {
      display: flex;
    }
  
    .msgs-cnt {
      width: 30%;
      height: 100dvh;
      overflow-y: auto;
      border-left: 1px solid rgba(255, 255, 255, 0.201);
      border-right: 1px solid rgba(255, 255, 255, 0.201);
      background-color: rgba(0, 255, 255, 0.043);
    }
  
    input {
      padding: 20px;
      margin: 10px;
      width: calc(100% - 20px);
      background-color: rgba(255, 255, 255, 0.128);
      border: 1px solid #21e3da;
      border-radius: 5px;
      color: white;
      font-size: 1.5em;
      outline: none;
      transition: all 0.3s;
  
      &:focus {
        box-shadow: 0px 0px 7px #21e3da;
      }
    }
  </style>
  