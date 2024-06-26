<script lang="ts">
  import { fade } from "svelte/transition";
  import type { ChatFeed } from "../stores/Feeds/ChatFeed.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import MessageComponent from "./MessageComponent.svelte";
  import type { Chat } from "../stores/Feeds/Chat.svelte";

  let {chat} : {chat: Chat} = $props();

  
  let before : string[] = [];
  let posMap : {[key : number] : number} = {};

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


</script>

{#await chat.getElements() then messages}
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
        {#if printDate(chat.newMessages[i].data.timestamp.split(" ")[1], i)}  <!--  -->
        <div class="msg-cnt" in:fade>
        <div class="day">
            {before[posMap[i]]}
        </div>
        </div>
        {/if}
        <MessageComponent message={chat.newMessages[i]} fade={true} />
    {/each}
    <!-- Vecchi messaggi -->
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
    <!-- Messaggi appena arrivati e mandati -->
    {#each chat.freshMessages as message}
        <MessageComponent {message} fade={false}/>
    {/each}
{/await}


<style>

.msg-cnt {
    display: grid;
    width: 100%;
    padding: 10px;
    font-size: 1.1em;
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
    cursor: pointer;

    &:hover {
      background-color: transparent;
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
</style>