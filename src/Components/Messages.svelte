<script lang="ts">
  import { goto } from "$app/navigation";
  import Chat from "./Chat.svelte";

    let { chats } : { chats : chatList } = $props();

</script>

{#if chats}

  {#each Object.keys(chats) as chatId}
    <button onclick={() => goto("/messages/"+chatId)}>{chatId}</button>
  {/each}

{/if}


<style>

</style>