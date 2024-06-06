<script lang="ts">
    import { collection, onSnapshot } from "firebase/firestore";
    import User from "../../../Components/User.svelte";
    import { MyUser } from "../../../stores/userState.svelte";
    import { db } from "$lib/firebase/firebase.client";
    import Loading from "../../../Components/Loading.svelte";
  import Chat from "../../../Components/Chat.svelte";
  import { ChatStore } from "../../../stores/ChatList.svelte";

    let { data } = $props();
    let loaded = $state(false);
    let error = $state(false);
    const userState = MyUser.getUser();

    $effect(() => {
        data;
        if(!data.id) return;

        const chatsPartecipants = data.id.split("&")

        if(chatsPartecipants[0] == userState.userInfo!.Username || chatsPartecipants[1] == userState.userInfo!.Username) loaded = true;
        else {
            console.log(chatsPartecipants[0], chatsPartecipants[1] )
            error = true;
            loaded = true;
        }
    })

</script>

{#if loaded}
    {#if !error}
        <Chat chat={ChatStore.getChatStote().getChat(data.id)}/>
    {:else}
        ERRORE!!!!!
    {/if}
{:else}
    <Loading />
{/if}


