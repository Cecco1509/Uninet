<script lang="ts">
  import { goto } from "$app/navigation";
  import { db, storage } from "$lib/firebase/firebase.client";
  import CanceIcon from "../../Components/Icons/CanceIcon.svelte";
  import LoadIcon from "../../Components/LoadIcon.svelte";
  import { CacheVolantini } from "../../stores/caches/CacheVolantini.svelte";
  import { uuidv4 } from "@firebase/util";
  import { ref, uploadBytes } from "firebase/storage";
  import Volantini from "../../Components/Volantini.svelte";

    ////////////////////////////////////////////////////////
  let modal = $state<HTMLDivElement>()
  let content = $state<HTMLDivElement>()
  const body = window.document.querySelector("body");

  let profileImage = $state("");
  let avatar = $state<FileList>();
  let input = $state<HTMLInputElement>();
  let titolo = $state("");
  let new_tag = $state("");
  let tags = $state<{[key : string] : boolean}>({});

  let tagList = $derived(Object.keys(tags))
 
  const handleInput = ()=>{

    if(!input || !avatar || avatar.length != 1) return;

    const file = avatar![0];

    const reader = new FileReader();
    reader.addEventListener("load", function () {
    profileImage = reader.result as string;
    });
    reader.readAsDataURL(file);

  }

  const handleTagSubmit = () =>{
    tags[new_tag] = true;
    new_tag = ""
  }

  const deleteSelection = () => {
    input!.value = "";
    profileImage= "";
  }

  const closeModal = function(event : MouseEvent | null) {
      if (event == null || event.target == modal) {
          modal!.style.display = "none";
          content!.style.opacity = "1"
          body!.style.overflowY = "auto";
          window.onclick = () => {}
      }
  }

  window.onclick  = closeModal;

  function handleEndOfPage(){
    console.log("called")
    feed.loadMore();
  }

  function openModal(){

    body!.style.overflowY = "hidden";
    content!.style.opacity = "0.6";
    modal!.style.display = "grid";

  }

  async function uploadCurrentPhoto(): Promise<string> {
    if(!avatar || avatar.length != 1) return "";

    let url = "volantiniImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      const result = await uploadBytes(imageRef, avatar[0]);
    } catch (e) {
      url = "";
      console.log("ERRORE UPLOAD")
    }

    return url;
  }

  async function handlePublish() {
    if(!profileImage || !titolo) return;

    cacheVolantini.publishVolantino(await uploadCurrentPhoto(), titolo, tagList);

    titolo = ""
    tags = {}
    input!.value = ""
    closeModal(null);

  }

    /////////////////////////////////////////////////////

  const cacheVolantini = CacheVolantini.getCache()
  let feed = $state(cacheVolantini.getHomeFeed());
  let feedType = $state(0);

  function updateFeed(){
    switch (feedType) {
      case 0:
        feed = cacheVolantini.getHomeFeed();
        break;
      case 1:
        feed = cacheVolantini.getDiscoveryFeed();
        console.log("discovery");
        break;
      default:
        break;
    }
  }

  
</script>

<div class="top-bar-cnt">
    <div class="top-bar">
        <select name="opt" id="opt" bind:value={feedType} onchange={updateFeed}>
            <option value={0} selected >Per te</option>
            <option value={1}>Discovery</option>
        </select>
        <span>Volantini</span>
        <button class="plus-btn" onclick={openModal}>+</button>
        
    </div>
</div>

<div class="outer-mdl" bind:this={modal}>
    <div class="inner-mdl">
        <div class="img-cnt">
            {#if profileImage}
                <img src={profileImage} alt="">
            {:else}
                <span>Carica un'immagine</span>
            {/if}
        </div>
        <div class="info-cnt">
            <div style="display: flex; align-items:center; justify-items:center ">
                <input type="file" bind:this={input} bind:files={avatar} name="profilePic" id="profileImg" accept="image/*" onchange={handleInput}>
                {#if profileImage}
                    <button class="deselect" onclick={deleteSelection}>
                        <CanceIcon />
                    </button>
                {/if}
            </div>

            <div>
                <label for="titolo">Inserici titolo</label>
                <input type="text" name="titolo" bind:value={titolo}/>
            </div>

            <div>
                <form onsubmit={handleTagSubmit}>
                    <label for="tags">Inserisci i tag relativi a questo volantino</label>
                    <input type="text" name="tags" id="" bind:value={new_tag}>
                </form>
                <div class="tags-cnt">
                  {#if tagList.length == 0}
                    <div class="tag example">Ripetizioni</div>
                    <div class="tag example">Matematica</div>
                    <div class="tag example">Informatica</div>
                  {:else}
                    {#each tagList as tag}
                      <div class="tag">{tag}</div>
                    {/each}
                  {/if}
                </div>
            </div>
            <button class="complete" onclick={handlePublish}>
              Pubblica
            </button>
        </div>
    </div>
</div>

<div class="cnt"  bind:this={content}>
    <Volantini {feed} inUserPage={false} editable={false}/>
</div>


<style>

    .tags-cnt{
      display: flex;
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }

    .tag{
      padding: 10px 20px;
      border:1px solid rgba(255, 255, 255, 0.82);
      margin: 10px;
      color: rgba(255, 255, 255, 0.82);
    }

    .example{
      opacity: 0.5;
    }

    .outer-mdl{
        width: calc(100dvw - 80px);
        height: 100%;
        top: 0px;
        left: 80px;
        z-index: 50;
        position: fixed;
        display: none;
        place-items: center;
    }

    .inner-mdl{
        width: 70%;
        height: 700px;
        transform: translateX(-40px);
        background-color: rgba(29, 29, 29, 1);
        color: black;
        padding: 10px;
        border-radius: 20px;
        display: flex;
        
        

        .img-cnt{
            width: 500px;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.127);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.679);
            aspect-ratio: 3 / 4;
            display: flex;
            justify-content: center;
            align-items: center;

            span{
                font-size: 2em;
                color : rgba(255, 255, 255, 0.679);
            }

            img{
                height: 100%;
                width: 100%;
                border-radius: 10px;
            }
        }

        .info-cnt{
            width: calc(100% - 500px);
            height: 100%;
            margin-left: 10px !important;
        }
    }

    .plus-btn{
        width: 45px;
        height: 45px;
        border-radius: 50%;
        cursor: pointer;
        background: linear-gradient(rgba(255, 255, 255, 0.169), rgba(255, 255, 255, 0.169)) padding-box,
              linear-gradient(60deg, #e6c960, #21d2b5) border-box;
        border: 0px solid transparent;

        font-size: 2em;
        color : white;

        transition: all 0.5s;

        &:hover{
            box-shadow: 0px 0px 5px 2px #e6c96082;
        }
    }

    .cnt{
        margin-top: 100px;
        display: grid;
        width: 100%;
        place-items: center;
        grid-template-columns: repeat(3, 1fr);
        overflow-x: hidden;
        gap: 30px;
        background-color: transparent;
        height: 100%;
        min-height: 100dvh;
        overflow: hidden;
    }

    .top-bar-cnt{
        height: 60px;
    }

    .top-bar-cnt{
        height: 60px;
        width: 100%;
        top : 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .top-bar{
        position: fixed;
        top : 20px;
        width: 700px;
        height: 60px;
        border-radius: 25px;
        background: rgba(255, 255, 255, 0.17);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.24);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 999;
    }

    input[type = text]{
        outline: none;
        width: calc(100% - 10px);
        margin: 5px 5px;
        height: 5vh;
        box-sizing: border-box !important;
        border-radius: 10px;
        background-color: #393e41;
        color: white;
        border: 2px solid #28736f;
        padding: 0px 10px;
        /*font-size: 16px;       */
        transition: all 0.5s;
        animation: fadeIn 0.7s forwards;

        &:focus {
        border-color: #21e3da;
        box-shadow: 0px 0px 6px #21e3da;
        }
    }

    label{
        padding-top: 20px;
        font-size: 1.1em;
        color: #5c5c5c;
    }

    .complete{
        border: 2px solid #21e3da;
        color: #21e3da;
        background-color: rgba(33, 227, 218, 0.1);

        &:hover{
        background-color: #20e1d0;
        color: #393e41;
        box-shadow: 0px 0px 6px #21e3da;
        }
    }

    /* .volantino{
        width: 30%;
        height: 1000px;
        margin-bottom: 2%;
        background-color: rgba(127, 255, 212, 0.392);
        margin: 10px;
        display: block;

        /* &:nth-child(3n+1) { order: 1; }
        &:nth-child(3n+2) { order: 2; }
        &:nth-child(3n)   { order: 3; }


        
    } */

    @keyframes fadeIn{
        0%{
        opacity: 0;
        }

        100%{
        opacity: 1;
        }
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


    /* Extra small devices (phones, 600px and down) */
    @media only screen and (max-width: 768px) {
        .cnt{
            display: block;
        }
    }
    /* Small devices (portrait tablets and large phones, 600px and up) 
    @media only screen and (min-width: 600px) {...}*/
    /* Medium devices (landscape tablets, 768px and up) */
    @media only screen and (max-width: 992px) {
        .cnt{
            grid-template-columns: repeat(2, 1fr);
        }
    }
    /* Large devices (laptops/desktops, 992px and up) 
    @media only screen and (min-width: 992px) {...} 
    /* Extra large devices (large laptops and desktops, 1200px and up)
    @media only screen and (min-width: 1200px) {...} */

</style>