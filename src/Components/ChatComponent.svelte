<script lang="ts">
  import { Chat } from "../stores/Chat.svelte";
  import { ChatStore } from "../stores/ChatList.svelte";
  import { MyUser } from "../stores/userState.svelte";

    let { chatId } : { chatId : string} = $props();
    let text = $state("");
    let chat = $state<Chat>();
    let messagesBox = $state<HTMLDivElement>();
    let before = "";

    $effect(() => {
        chat;
        console.log(chat);
        chat = ChatStore.getChatStore().getChat(chatId)
        if(!chat){
            chat = new Chat("", chatId, {lastMessage: "", timestamp: ""});
        }
    })

    const printDate = (date : string) : boolean => {
        if(date == before) return false;
        before = date;
        return true;
    }

</script>


<div class="info"> info </div>
<div class="msgs-cnt" bind:this={messagesBox}>
    <div>
    {#if chat && chat.id != ""}
    {#each chat.messages as message}
        {#if printDate(message.timestamp?.split(" ")[1])}
            <div class="msg-cnt">
                <div class="day">
                    {before}
                </div>
                
            </div>
        {/if}
        <div class="msg-cnt">
            <div class={message.sender == MyUser.getUser().userInfo?.Username ? "sended msg-box" : "received msg-box"}>
                <div class="msg-text">
                    {message.text}
                </div>
                <div class="time">
                    {message.timestamp?.split(" ")[0]}
                </div>
            </div>
        </div>
        <br>
    {/each}
{/if}
</div>
</div>

<form class="text-box">
    <input type="text" bind:value={text}>
    <button onclick={() => {chat!.send(text); text = ""}}> Invia </button>
</form>

<style>

    .info{
        width: 100%;
        height: 8dvh;
        position: fixed;
        background-color: rgba(255, 255, 255, 0.419);
        backdrop-filter: blur(3px);
    }

    .msgs-cnt{
        width: 100%;
        height: 100dvh;
        overflow-y: auto;
        display: flex;
        flex-direction: column-reverse;
        padding: 5dvh 0px;
    }

    .text-box{
        position: fixed;
        width: 100%;
        height: 6dvh;
        bottom: 0px;
        background-color: transparent;
        padding: 5px;
        display: flex;
        backdrop-filter: blur(3px);
    }

    input{
        height: 6dvh;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.143);
        outline: none;
        border: 1px solid grey;
        border-radius: 25px;
        color: white;
        width: 65%;
        font-size: 1.2em;
        padding-left: 15px;
    }

    .msg-cnt{
        display: grid;
        width: 100%;
        padding: 10px;
        font-size: 1.1em;
    }

    button{
        border-radius: 25px;
        background-color: transparent;
        cursor: pointer;
        width: 100px;
        height: 60px;
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

        &:hover{
            background-color: rgba(33, 227, 217, 0.383);
        }
    }

    .msg-box{
        padding: 10px;
        width:200px;
        border-radius: 15px;
        width:40%;
        display: grid;
    }

    .sended{
        background-color: #21e3d927;
        background-color: #21e3d989;
        justify-self: flex-end;
        padding-right: 20px;
    }

    .received{
        background-color: #ffffff23;
        border: 1px solid #ffffff33;
        justify-self: flex-start;
    }

    .time{
        justify-self: flex-end;
    }

    .msg-text{
        width: 100%;
        padding-bottom: 5px;
    }

    .day{
        color: grey;
        justify-self: center;
        text-align: center;
        width: 100px;
        border: 1px solid grey;
        padding: 5px;
        border-radius: 5px;
        align-self: center;
    }

</style>
