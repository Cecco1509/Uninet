<script lang="ts">
    import { limitToFirst, onValue, query, ref, startAfter } from "firebase/database";
    import Messages from "../../Components/Messages.svelte";
    import { DataBasaConn } from "../../stores/db.svelte";
    import { MyUser } from "../../stores/userState.svelte";
    import { realtimeDB } from "$lib/firebase/firebase.client";
    import { set } from "firebase/database"
    import { uuidv4 } from "@firebase/util";
    import { ChatStore } from "../../stores/ChatList.svelte";
  import ChatComponent from "../../Components/ChatComponent.svelte";
  
      const userState = MyUser.getUser();
      const db = DataBasaConn.getDB();
      let chatStore = ChatStore.getChatStore();
      let searchUser = $state<string>("");
      let chatId = $state("");
      let bindId = $state("");
      let selectedChat = $state("");
  
      const handleChange = function(){
  
      }

      $effect(() => {
        chatId = window.location.href.split("#")[1];
        //if(chatId == selectedChat) return
      })

      $inspect(selectedChat);
  
  </script>
  
  <div class="cnt">
    <div class="msgs-cnt">
        Messaggi
      
        <form autocomplete="off">
          <input autocomplete="off"  type="search" bind:value={searchUser} onkeyup={handleChange} placeholder="Cerca per username">
        </form>
        
        <Messages chats={chatStore.chats} chatId={chatId} bind:bindId={bindId}/>
    
      </div>
      <div class="cht-cnt">
        {#if !bindId}
            <div>
                <span>Seleziona una chat</span>
            </div>
        {:else}
            <ChatComponent chatId={bindId} />
            
        {/if}
      </div>
  </div>
  
  
  <style>

    .cht-cnt{
        width: 100%;
        height: 100dvh;
    }

    span{
        font-size: 1.4em;
    }

    .cnt{
        display: flex;
    }

    .msgs-cnt{
        width: 30%;
        height: 100dvh;
        overflow-y: auto;
        border-left: 1px solid rgba(255, 255, 255, 0.201);
        border-right: 1px solid rgba(255, 255, 255, 0.201);
    }

    input{
          padding: 20px;
          margin: 10px;
          width: calc(100% - 20px);
          background-color: #e6c96021;
          border: 1px solid #e6c960;
          border-radius: 5px;
          color: white;
          font-size: 1.5em;
          outline: none;
          transition: all 0.3s;
  
          &:focus{
              box-shadow: 0px 0px 7px #e6c960;
          }
      }
  
      
  </style>