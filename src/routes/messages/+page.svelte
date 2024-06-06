<script lang="ts">
  import { limitToFirst, onValue, query, ref, startAfter } from "firebase/database";
  import Messages from "../../Components/Messages.svelte";
  import { DataBasaConn } from "../../stores/db.svelte";
  import { MyUser } from "../../stores/userState.svelte";
  import { realtimeDB } from "$lib/firebase/firebase.client";
  import { set } from "firebase/database"
  import { uuidv4 } from "@firebase/util";
  import { ChatStore } from "../../stores/ChatList.svelte";

    const userState = MyUser.getUser();
    const db = DataBasaConn.getDB();
    let chatStore = ChatStore.getChatStote();
    let searchUser = $state<string>("");

</script>

<input type="text" bind:value={searchUser}>

<button onclick={async () => {await chatStore.addChat(searchUser); searchUser = ""}}>
    aggiungi chat
</button>

<br>

<Messages chats={chatStore.chats} />