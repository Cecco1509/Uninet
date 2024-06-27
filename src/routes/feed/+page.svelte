<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { MyUser } from "../../stores/userState.svelte";
  import { ref, uploadBytes } from "firebase/storage";
  import { uuidv4 } from "@firebase/util";
  import Posts from "../../Components/Posts.svelte";
  import CanceIcon from "../../Components/Icons/CanceIcon.svelte";
  import { PostCache } from "../../stores/caches/PostCache.svelte";
  import { CacheVolantini } from "../../stores/caches/CacheVolantini.svelte";
  import { ChatCache } from "../../stores/caches/ChatCache.svelte";
  import { UserInfosCache } from "../../stores/caches/UserInfosCache.svelte";
  import { MenuStore, Positions } from "../../stores/Menu.svelte";
  import Popup from "../../Components/Popup.svelte";

  const userState = MyUser.getUser();
  
  const user = MyUser.getUser();
  const postStore = PostCache.getCache();
  // const userInfosStore = UserInfosCache.getCache();
  // const volantiniStore = CacheVolantini.getCache();
  // const chatStore = ChatCache.getCache();

  let feed = $state(postStore.getHomeFeed());
  let feedType = $state(0);

  MenuStore.getMenu().currentSection = Positions.Feed;

  let postText = $state("");
  let error = $state("");
  let avatar = $state<FileList | null>();
  let input = $state<HTMLInputElement>();
  let postImage = $state("");
  let popup = $state<{result : {esito : boolean, message : string}, i : number} | undefined>();

  async function uploadCurrentPhoto(): Promise<string> {
    if (!avatar || avatar.length == 0) return "";

    let url = "postImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];
    const imageRef = ref(storage, url);
    await uploadBytes(imageRef, avatar[0]);
    
    return url;
  }

  const handleImageInput = ()=>{

    if(!input || !avatar || avatar.length != 1) return;

    const file = avatar![0];

    const reader = new FileReader();
    reader.addEventListener("load", function () {
      postImage = reader.result as string;
    });
    reader.readAsDataURL(file);
    }

  const deleteSelection = () => {
    input!.value = "";
    postImage= "";
  }

  async function handleSubmit() {
    if (!postText && !postImage) {
      popup = {result : {esito : false, message: "Inserisci un immagine o del testo"}, i : popup ? popup.i + 1 : 0};
      return;
    };

    try {
      const r = await postStore.publishPost(postText, await uploadCurrentPhoto());
      popup = {result : r, i : popup ? popup.i + 1 : 0};
      console.log(popup);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      postText = "";
      input!.value="";
      postImage= "";
      feedType = 0;
      feed = postStore.getHomeFeed();
    }
  }

  function updateFeed(){
    switch (feedType) {
      case 0:
        feed = postStore.getHomeFeed();
        break;
      case 1:
        feed = postStore.getDiscoveryFeed();
        break;
      default:
        break;
    }
  }

</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

{#if popup}
  {#key popup.i}
    <Popup message={popup?.result.message} success={popup?.result.esito} />
  {/key}
{/if}

<div class="publish">
  <br />
  <h1>Feed</h1>
  <select name="feedOpt" id="opt" bind:value={feedType} onchange={updateFeed}>
    <option value={0}>Per te</option>
    <option value={1}>Discover</option>
  </select>
  <br />
  <br />
  {#if postImage}

    <div class="new-post-img">
      <img src={postImage} alt="new post foto">
    </div>
    <label for="text">descrizione</label>
  {/if}
  <textarea id="text" spellcheck="false" class={postImage ? "description" : ""} placeholder={postImage ? "Inserisci una descrizione" : "Che succede?"} bind:value={postText}></textarea>
  <div class="inp-spacer">
    <div class="file-inp-wrapp">
      <input bind:this={input} onchange={handleImageInput} bind:files={avatar} type="file" accept="image/*" />
      {#if postImage}
        <button class="deselect" onclick={deleteSelection}>
          <CanceIcon />
        </button>
      {/if}
    </div>
    
    <button onclick={handleSubmit}>Pubblica</button>
  </div>
</div>
<div>
  <hr />
  <Posts feed={feed} inUserPage={false} editable={false} />
</div>

<!-- Cose da fare qui

    - Far vedere i post della gente
    - Box per creare un post (Ora)
    - barra in alto?
    - barra in basso? (✔️)
    - Barra laterale?

-->

<style>

  label{
    margin-top: 20px;
    padding-top: 20px;
    padding-left: 20px;
    font-size: 1.1em;
    color: #5c5c5c;
  }

  .new-post-img{

    width: 100%;
    height: 500px;
    background-color: #393e41;
    display: grid;
    place-items: center;
    margin-bottom: 20px;

    img{
      height: 500px;
      width: 500px;
      object-fit: cover;
      opacity: 1;
      aspect-ratio: 1/1;
    }
  }

  .file-inp-wrapp{
    display: flex;
    align-items: center;
    width: 60%;
  }

  .deselect{
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    margin-left: 10px;
    align-items: center;
    background-color: transparent;
    border: none;

    &:hover{
      background-color: transparent;
      box-shadow: none;
    }
  }

  input[type=file] {
    width: 100%;
    color: #444;
    padding: 5px;
    background: #ffffff00;
    border-radius: 10px;
    border: 1px solid #555;
    height: max-content;
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

  .inp-spacer {
    margin: 10px 0px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .consigliati{
    height: 200px;
    width: 100%;
    background-color: blue;
  }

  .publish {
    padding: 10px;
  }

  textarea {
    resize: none;
    width: 100%;
    height: 150px;
    background-color: transparent;
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.201);
    border-radius: 5px;
    color: white;
    font-size: 2em;
    padding: 10px;
    transition: all 0.5s;

    &:focus {
      border: 1px solid #e6c960;
    }
  }


  .description{
    height: 100px;
    font-size: 1.5em;
  }

  button {
    border-radius: 10px;
    background-color: transparent;
    cursor: pointer;
    width: 100px;
    height: 50px;
    border-color: #21e3da;
    border: 2px solid #21e3da;
    margin: 5px 0px;
    background-color: rgba(33, 227, 218, 0.1);
    /*font-size: 20px;       */
    color: #21e3da;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    background-color: #20e1d0;
    color: #393e41;
    box-shadow: 0px 0px 6px #21e3da;
  }

  * {
    max-width: 100%;
  }

  @keyframes fadeIn{
    0%{
      opacity: 0;
    }

    100%{
      opacity: 1;
    }
  }
</style>
