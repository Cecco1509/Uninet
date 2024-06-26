<script lang="ts">
  import { UserInfosCache } from "../stores/caches/UserInfosCache.svelte";
  import type { Message } from "../stores/FeedElements/Message.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";


  let {message, fade} : {message : Message; fade:boolean} = $props();
  let sended = message.data.sender == MyUser.getUser().userInfo?.Username;
  let userInfo = UserInfosCache.getCache().getUserInfo(message.data.sender, "MESSAGE").data;

</script>

{#if userInfo}
  <div class={fade ? "msg-cnt fade" : "msg-cnt"}>
    
    {#if !sended}
      <div style="display: flex; gap:10px; align-items:center; margin-bottom: 5px; margin-left: 10px;">
        
          <ProfileIcon img={userInfo!.img} inRegistration={false} dimension={"small"} />
        
        <span>{message.data.sender}</span>
      </div>
    {/if}
    
    <div
      class={sended
        ? "sended msg-box"
        : "received msg-box"}
    >
      <div class="msg-text">
        {message.data.text}
      </div>
      <div class="time">
        {message.data.timestamp.split(" ")[0]}
      </div>
    </div>
  </div>
{/if}

<style>
  .msg-cnt {
      display: grid;
      width: 100%;
      padding: 10px;
      font-size: 1.1em;
    }
  
    .fade{
      animation: fade-in .5s forwards ease-in-out;
      transform: translateY(-5dvh);
    }
  
    @keyframes fade-in{
      0%{
        opacity: 0;
        transform: translateY(-5dvh);
      }
      100%{
        opacity: 1;
        transform: translateY(0dvh);
      }
    }
  
    .msg-box {
      padding: 10px;
      width: 200px;
      border-radius: 15px;
      width: 40%;
      display: grid;
      border: 2px solid black;
    }
  
    .sended {
      background-color: #21e3d927;
      background-color: #21e3d989;
      border-color: #21e3da;
      justify-self: flex-end;
    }
  
    .received {
      background-color: #ffffff23;
      border-color: #ffffff33;
      justify-self: flex-start;
    }
  
    .time {
      justify-self: flex-end;
    }
  
    .msg-text {
      width: 100%;
      padding-bottom: 5px;
    }
</style>