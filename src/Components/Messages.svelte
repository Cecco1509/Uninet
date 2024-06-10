<script lang="ts">
  import { goto } from "$app/navigation";
  import { DataBasaConn } from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

    let { chats , chatId ,bindId = $bindable()} : { chats : chatList, chatId : string, bindId : string } = $props();

</script>
{#key chats}
  {#if chats}
    {#each Object.keys(chats) as chatId_}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- goto("/messages/"+chats[chatId]?.to -->
      <div class={bindId == chatId_ ? "usr-cnt active" : "usr-cnt"} onclick={() => {bindId = chatId_; window.location.href = window.location.href.split("#")[0] + "#"+bindId}}>
        {#await DataBasaConn.getDB().getUserInfo(chats[chatId_]!.to)}
          <LoadIcon />
        {:then userInfo}
            <div class="info">
              <ProfileIcon img={userInfo!.img} inFeed={true}/>
              <div>
                  <span>
                      {userInfo?.Username}
                  </span><br>
                  <span class="flws">
                      {chats[chatId_]?.chatInfo?.lastMessage} • {chats[chatId_]?.chatInfo?.timestamp}
                  </span>
              </div>
            </div>
        {/await}
      </div>
    {/each}
  {/if}
{/key}


<style>
  .info{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .active{
      border-color: #e6c9606a !important;
    }

    span{
        padding-left: 10px;
        font-size: 1.3em;
        vertical-align: middle;
    }

    /* .empty-list{
        height: 100px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button{
        cursor: pointer;
        margin-left: 10px;
        border: none;
        border-radius: 5px;
        background-color: transparent;
        color: white;
        width: auto;
        padding: 8px;
        transition: all 0.3s;

        &:hover{
            background-color: #e6c9605c;
            
        }
    } */

    .usr-cnt{
        margin: 10px;
        border: 1px solid gray;
        border-radius: 5px;
        padding: 10px 20px;
        width: calc(100% - 20px);
        background-color: rgba(255, 255, 255, 0.086);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s;

        &:hover{
            border-color: #e6c9606a;
            cursor: pointer;
        }
    }

    .flws{
        color: rgba(255, 255, 255, 0.744);
        font-size: 1em;
    }
</style>