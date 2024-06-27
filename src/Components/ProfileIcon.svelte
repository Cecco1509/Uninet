<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import userDefault from "$lib/assets/userDefault.png";
  import groupDefault from "$lib/assets/groupDefault.png";
  import { MenuStore } from "../stores/Menu.svelte";

  let { img, inRegistration, dimension, groupIcon} : { img: string | null; inRegistration : boolean; groupIcon : boolean; dimension : string} = $props();
  let profileImg = $state<any>();

  $effect(() => {
    if (!img ||inRegistration || MenuStore.getMenu().offline) return;
    if( profileImg == null || profileImg.src == null) return;

    try {
      const imageRef = ref(storage, img);
      getDownloadURL(imageRef)
        .then((url) => {
          profileImg!.src = url;
        })
        .catch((error) => {
          console.log(error.message);
        });
    } catch (e) {
      console.log("Errore durante il caricamento dell'immagine profilo");
    }
  });
  //
</script>

{#if dimension == "big"}
  <div class={groupIcon ? "groupBorder userPageImg" : "border userPageImg"}>
    <img bind:this={profileImg} src={inRegistration && img ? img : (groupIcon ? groupDefault : userDefault)} alt=""/>
  </div>
{:else if dimension == "medium"}
  <div class={groupIcon ? "groupBorder userPostImg" : "border userPostImg"}>
    <img bind:this={profileImg} src={(groupIcon ? groupDefault : userDefault)} alt=""/>
  </div>
{:else if dimension == "small"}
  <div class="border userMessageImg">
    <img bind:this={profileImg} src={(groupIcon ? groupDefault : userDefault)} alt=""/>
  </div>
{/if}



<style>

  .border{
    background: linear-gradient(white, white) padding-box,
              linear-gradient(60deg, #ffffff8d, #21d2b5) border-box;
    border-radius: 50px;
    border: 2px solid transparent;
    /* border-image: linear-gradient(to right, #ffffff8d, #21d2b5) 1; */
  }

  .groupBorder{
    background: linear-gradient(white, white) padding-box,
              linear-gradient(60deg, #ffffff8d, #e6c960) border-box;
    border-radius: 50px;
    border: 2px solid transparent;
    /* border-image: linear-gradient(to right, #ffffff8d, #21d2b5) 1; */
  }

  .userPageImg {
    max-height: 150px !important;
    max-width: 150px !important;
    border-radius: 50%;
    image-rendering: optimizeSpeed;
    background-size: cover;
  }

  .userPostImg {
    height: 70px !important;
    width: 70px !important;
    border-radius: 50%;
    image-rendering: optimizeSpeed;
    background-size: cover;
  }

  .userMessageImg{
    height: 30px !important;
    width: 30px !important;
    border-radius: 50%;
    image-rendering: optimizeSpeed;
    background-size: cover;
  }

  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
    background-size: cover;
  }
</style>
