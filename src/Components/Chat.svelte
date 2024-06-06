<script lang="ts">
  import { realtimeDB } from "$lib/firebase/firebase.client";
  import { onChildAdded, onValue, ref, set } from "firebase/database";
  import { Timestamp } from "firebase/firestore";
  import type { Chat } from "../stores/Chat.svelte";
  import { Date } from "svelte/reactivity";
  import { MyUser } from "../stores/userState.svelte";


    let { chat } : { chat : Chat} = $props();
    let text = $state("");

</script>

{#if chat}
    {#each chat.messages as message}
        <div class="msg-cnt">
            messageText : {message.text}
            time : {message.timestamp}
        </div>
        <br>
    {/each}
{/if}
<form>
    <input type="text" bind:value={text}>
    <button onclick={() => {chat.send(text); text = ""}}> invia </button>
</form>

<style>
    .msg-cnt{
        height: 100px;
        width:200px;
        background-color: rgba(128, 128, 128, 0.363);
    }
</style>
