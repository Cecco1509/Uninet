<script lang="ts">
    import Messages from "../../Components/Messages.svelte";
    import { MyUser } from "../../stores/userState.svelte";
    import { set } from "firebase/database";
    import { uuidv4 } from "@firebase/util";
    import ChatComponent from "../../Components/ChatComponent.svelte";
    import { UserInfosCache } from "../../stores/caches/UserInfosCache.svelte";
    import { ChatCache } from "../../stores/caches/ChatCache.svelte";
    import { MenuStore, Positions } from "../../stores/Menu.svelte";
  import { Query, collection, getDocs, query, where } from "firebase/firestore";
  import { db, storage } from "$lib/firebase/firebase.client";
  import SearchBar from "../../Components/SearchBar.svelte";
  import ProfileIcon from "../../Components/ProfileIcon.svelte";
  import { ref, uploadBytes } from "firebase/storage";
  import CanceIcon from "../../Components/Icons/CanceIcon.svelte";
  import LoadIcon from "../../Components/LoadIcon.svelte";
  import Loading from "../../Components/Loading.svelte";
  import GroupChat from "../../Components/GroupChat.svelte";
  import GroupChatComponent from "../../Components/GroupChatComponent.svelte";
  
    const userState = MyUser.getUser();
    const userBD = UserInfosCache.getCache();
    ////////////////////////////////////////////////////////
    let chatStore = ChatCache.getCache();
    let searchText = $state<string>("");
    let searchTextBox = $state<string>("");
    let bindId = $state("");
    let chatId = $state("");
  
    MenuStore.getMenu().currentSection = Positions.MessGroups;

    let queryText = $derived(searchText.toLowerCase())
  
    let messagesList = $derived(
      Object.keys(chatStore.groupChats).filter((chatId) => {
        return chatId.toLowerCase().includes(queryText)
      }
    ))

    let searchMessages = $state<groupChatInfo[]>([]);
    let searchUsers = $state<UserInfo[]>([]);
    let typing = $state(false);
  
    $inspect("message list", messagesList);
  
    $effect(() => {
      chatId = window.location.href.split("#")[1];
      if (chatId == "") chatId = bindId;
      //if(chatId == selectedChat) return
    });

    let modal = $state<HTMLDivElement>()
    let modal1 = $state<HTMLDivElement>();
    let content = $state<HTMLDivElement>()
    const body = window.document.querySelector("body")

    const closeModal = function(event : MouseEvent | null) {
        if (event == null || event.target == modal || event.target == modal1) {
            modal!.style.display = "none";
            modal1!.style.display = "none";
            content!.style.opacity = "1"
            body!.style.overflowY = "auto";
            window.onclick = () => {}
        }
    }

    function openModal(){

        body!.style.overflowY = "hidden";
        content!.style.opacity = "0.6";
        modal!.style.display = "grid";
        window.onclick  = closeModal;

    }

    function openModal1(){

        body!.style.overflowY = "hidden";
        content!.style.opacity = "0.6";
        modal1!.style.display = "grid";
        window.onclick  = closeModal;

    }

    let partecipantsUsers = $state<UserInfo[]>([])

    ////////////////////////////////////////////////////////////////////////////////// FOTO

    let input = $state<HTMLInputElement>();
    let avatar = $state<FileList>();
    let profileImage = $state("");
    const handleInput = ()=>{

        if(!input || !avatar || avatar.length != 1) return;

        const file = avatar![0];

        const reader = new FileReader();
        reader.addEventListener("load", function () {
        profileImage = reader.result as string;
        });
        reader.readAsDataURL(file);

    }

  const deleteSelection = () => {
    input!.value = "";
    profileImage= "";
  }

  async function uploadCurrentPhoto(): Promise<string> {
    if(!avatar || avatar.length != 1) return "";

    let url = "groupsInfosImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      await uploadBytes(imageRef, avatar[0]);
    } catch (e) {
      url = "";
      console.log("ERRORE UPLOAD")
    }

    return url;
  }

  let newGroupName = $state("")

  async function createGroup() {
    creating = true;
    const partecipanti : string[] = [];
    partecipantsUsers.forEach(user => {partecipanti.push(user!.Username)})
    const result = await ChatCache.getCache().addGroupChat(newGroupName, partecipanti, await uploadCurrentPhoto())

    if(result.created) closeModal(null);
    else console.log(result.errMessage);
    creating = false;
  }

  function clear() {
    typing = false;
    searchUsers = [];
    searchText = ""
  }

  let creating = $state(false);

  async function joinGroup(name : string) {
    creating = true;

    const result = await ChatCache.getCache().join(name)

    if(result.joined) closeModal(null);
    else console.log(result.errMessage);

    creating = false;
  }
</script>

<div class="outer-mdl" bind:this={modal}>
    <div class="inner-mdl">
        
        <div style="height: max-content; display:flex; justify-content:space-between; margin-bottom:10px;">
            <span class="title">Crea un gruppo</span>
            <button class="crea" onclick={createGroup} disabled={partecipantsUsers.length < 2 || !newGroupName} >
                {#if creating}
                    <LoadIcon />
                {:else}
                    Crea
                {/if}
            </button>
        </div>
        
        
        <div class="create-inputs">
            <div style="margin: 20px 0px;">
                <span> Seleziona un'immagine profilo </span>
                <div style="display: flex; align-items:center; margin-top:10px; gap: 10px;">
                    <div class="profile-img">
                        <ProfileIcon img={profileImage} inRegistration={true} dimension={"big"}/>
                    </div>
                    
                    <div class="file-inp">
                        <input type="file" bind:this={input} bind:files={avatar} name="profilePic" id="profileImg" accept="image/*" onchange={handleInput}>
                        {#if profileImage}
                        <button class="deselect" onclick={deleteSelection}>
                            <CanceIcon />
                        </button>
                        {/if}
                    </div>
                </div>
            
            </div>
            <div style="margin-top:30px; margin-left:10px;">
                <span>Scegli un nome</span>
            </div>
            <input type="text" name="name" bind:value={newGroupName}>

            <div style="margin-top:30px; margin-left:10px;">
                <span>Aggiungi i partecipanti</span>
            </div>
            
            <div>
                <SearchBar 
                bind:elements={searchUsers}
                bind:typing={typing}
                bind:searchText={searchTextBox}
                collectionName={"Users"}
                field={"Username"}
                />

            <!-- actions={[(elem) => partecipantsUsers.push(elem)]}
                actionsText={["Aggiungi"]} -->
            {#if !typing}
                {#if searchUsers.length == 0}
                    <div class="empty-list">
                    {#if searchText.length != 0}
                        <span>utente non trovato</span>
                    {/if}
                    </div>
                {:else}
                    <span class="result">Risultati : </span>
                    <br /><br />
                    {#each searchUsers as element}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                
                        {#if !partecipantsUsers.find(e => e?.Username == element?.Username)}
                            <div class="usr-cnt">
                                <div class="info">
                                <ProfileIcon img={element!.img} inRegistration={false} dimension={"medium"} />
                                <div>
                                    <span>
                                    {element?.Username}
                                    <!-- {element?.name} -->
                                    </span>
                                    <span class="flws">
                                    • {element?.Followers} <!-- {element.n_partecipants} --> Followers
                                    </span>
                                </div>
                                </div>
                                <div>
                                    <button onclick={() => {partecipantsUsers.push(element); clear();}}
                                        >Aggiungi
                                    </button>
                                </div>
                            </div>
                        {/if}
                    {/each}
                {/if}
            {:else}
                <LoadIcon />
            {/if}

            {#if partecipantsUsers.length > 0}
                <div style="margin-top:30px; margin-left:10px;">
                    <span>Partecipanti</span>
                </div>
            {/if}
            {#each partecipantsUsers as user}
            <div class="usr-cnt">
                <div class="info">
                <ProfileIcon img={user!.img} inRegistration={false} dimension={"medium"} />
                <div>
                    <span>
                    {user?.Username}
                    </span>
                    <span class="flws">
                    • {user?.Followers} Followers
                    </span>
                </div>
                </div>
                <div>
                    <button onclick={()=> {partecipantsUsers = partecipantsUsers.filter((u)=> u?.Username != user?.Username); console.log(partecipantsUsers)}}>
                        Rimuovi
                    </button>
                </div>
            </div>
            {/each}
            </div>
            
        </div>
    </div>
        
</div>
<div class="outer-mdl" bind:this={modal1}>
    <div class="inner-mdl">
        
        <div style="height: max-content; display:flex; justify-content:space-between; margin-bottom:10px;">
            <span class="title">Cerca ed entra in un nuovo gruppo</span>
        </div>
        
        
        <div class="create-inputs">
            <SearchBar 
            bind:elements={searchMessages}
            bind:typing={typing}
            bind:searchText={searchTextBox}
            collectionName={"groupsChatsInfo"}
            field={"name"}
            />

            <!-- actions={[(elem) => partecipantsUsers.push(elem)]}
                actionsText={["Aggiungi"]} -->
            {#if !typing}
                {#if searchMessages.length == 0}
                    <div class="empty-list">
                    {#if searchText.length != 0}
                        <span>gruppo non trovato</span>
                    {/if}
                    </div>
                {:else}
                    <span class="result">Risultati : {searchMessages.length}</span>
                    <br /><br />
                    {#each searchMessages as element}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                
                        <!-- {#if !partecipantsUsers.find(e => e?.name == element?.name)} -->
                            <div class="usr-cnt">
                                <div class="info">
                                <ProfileIcon img={element!.img} inRegistration={false} dimension={"medium"} />
                                <div>
                                    <span>
                                    {element?.name}
                                    <!-- {element?.name} -->
                                    </span>
                                    <span class="flws">
                                    • {element?.n_partecipants} <!-- {element.n_partecipants} --> Partecipanti
                                    </span>
                                </div>
                                </div>
                                <div>
                                    <button onclick={() => joinGroup(element.name)}
                                        >
                                        {#if creating} 
                                            <LoadIcon />
                                        {:else}
                                            Partecipa
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        <!-- {/if} -->
                    {/each}
                {/if}
            {:else}
                <LoadIcon />
            {/if}
                            
            {#if partecipantsUsers.length > 0}
                <div style="margin-top:30px; margin-left:10px;">
                    <span>Partecipanti</span>
                </div>
            {/if}
            {#each partecipantsUsers as user}
            <div class="usr-cnt">
                <div class="info">
                <ProfileIcon img={user!.img} inRegistration={false} dimension={"medium"} />
                <div>
                    <span>
                    {user?.Username}
                    </span>
                    <span class="flws">
                    • {user?.Followers} Followers
                    </span>
                </div>
                </div>
                <div>
                    <button onclick={()=> {partecipantsUsers = partecipantsUsers.filter((u)=> u?.Username != user?.Username); console.log(partecipantsUsers)}}>
                        Rimuovi
                    </button>
                </div>
            </div>
            {/each}
            
        </div>
    </div>
</div>
<div class="cnt" bind:this={content}>
<div class="msgs-cnt">

    <form autocomplete="off">
        <input
            autocomplete="off"
            type="search"
            bind:value={searchText}
            placeholder="Cerca"
        />
    </form>

    <!-- <SearchBar bind:users={searchMessages} bind:typing={typing} collectionName={"groupsChatsInfos"} field={"name"}/>
    {typing}
    {searchMessages.length} -->

    <button onclick={openModal}>Crea</button>
    <button onclick={openModal1}>Entra</button>

    <GroupChat chats={messagesList} {chatId} bind:bindId />
</div>
<div class="cht-cnt">
    {#if !bindId && !chatId}
    <div class="nothing">
        <span>Seleziona una chat</span>
    </div>
    {:else if !bindId && chatId}
        <GroupChatComponent {chatId} />
    {:else}
        <GroupChatComponent chatId={bindId} />
    {/if}
</div>
</div>
  
<style>

    .outer-mdl{
        width: calc(100dvw - 80px);
        height: 100%;
        top: 0px;
        left: 80px;
        z-index: 50;
        position: fixed;
        display: none;
        place-items: center;
        padding-top : 60px;
        z-index: 4;
    }

    .inner-mdl{
        width: 70%;
        height: 700px;
        transform: translateX(-40px);
        background-color: rgba(29, 29, 29, 1);
        color: white;
        padding: 30px;
        border-radius: 20px;
        overflow-y: hidden;

        span{
            font-size: 2em;
        }
        
    }
  
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
  
    span{
        font-size: 1.1em !important;
        opacity: 0.8;
    }

    .title {
      font-size: 2.5em !important;
      color: white;
      opacity: 1 !important;
    }
  
    .cnt {
      display: flex;
    }
    label{
            padding-top: 20px;
            font-size: 1.1em;
            color: #5c5c5c;
          }
        
  
    .msgs-cnt {
      width: 30%;
      height: 100dvh;
      overflow-y: auto;
      border-left: 1px solid rgba(255, 255, 255, 0.201);
      border-right: 1px solid rgba(255, 255, 255, 0.201);
      background-color: rgba(0, 255, 255, 0.043);
    }

    input[type = "text"] {
        outline: none;
        width: 100%;
        margin: 5px 0px;
        box-sizing: border-box !important;
        border-radius: 10px;
        background-color: #e6c96021;
        border: 1px solid #e6c960;
        color: white;
        padding: 20px;
        font-size: 1.5em;
        /*font-size: 16px;       */
        transition: all 0.5s;
        animation: fadeIn 0.7s forwards;

        &:focus {
            box-shadow: 0px 0px 7px #e6c960;
        }
    }

    input[type = "search"] {
        outline: none;
        width: calc(100% - 20px);
        margin: 10px;
        box-sizing: border-box !important;
        border-radius: 10px;
        background-color: #e6c96021;
        border: 1px solid #e6c960;
        color: white;
        padding: 20px;
        font-size: 1.5em;
        /*font-size: 16px;       */
        transition: all 0.5s;
        animation: fadeIn 0.7s forwards;

        &:focus {
            box-shadow: 0px 0px 7px #e6c960;
        }
    }

    .info {
        display: flex;
        justify-content: center;
        align-items: center;

        span {
            padding-left: 10px;
            font-size: 1.3em;
            vertical-align: middle;
        }
    }

  button {
    cursor: pointer;
    margin-left: 10px;
    border: none;
    border-radius: 5px;
    background-color: transparent;
    color: white;
    width: auto;
    padding: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: #e6c9605c;
    }
  }

  .usr-cnt {
    margin: 10px 0px;
    border: 1px solid gray;
    border-radius: 5px;
    padding: 10px 20px;
    width: calc(100% - 20px);
    background-color: rgba(255, 255, 255, 0.086);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    &:hover {
      border-color: #e6c9606a;
    }
  }

  .flws {
    color: rgba(255, 255, 255, 0.744);
    padding: 0px;
    font-size: 1em !important;
  }

  input[type=file] {
    margin: 10px 0px;
    max-width: 100%;
    color: #444;
    padding: 5px;
    background: #ffffff00;
    border-radius: 10px;
    border: 1px solid #555;
  }

  input[type=file]::file-selector-button {
    margin-right: 20px;
    border: none;
    background: #21e3d99e;
    padding: 10px 20px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: background .2s ease-in-out;
  }

  input[type=file]::file-selector-button:hover {
    background: #21e3d942;
  }


  .crea{
    font-size: 2em;
    background-color: #e6c9602f;
    top: 40px;
    right: 40px;
    z-index: 10;
    backdrop-filter: blur(20px);
    --webkit-backdrop-filter: blur(20px);


    &:disabled{
        opacity: 0.5;
    }
  }

  .create-inputs{
    overflow-y: auto !important;
    height:calc(100% - 50px);
    padding-right: 10px !important;
  }
</style>
  