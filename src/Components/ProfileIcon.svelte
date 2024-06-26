<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import userDefault from "$lib/assets/userDefault.png";

  let { img, inRegistration, dimension } : { img: string | null; inRegistration : boolean; dimension : string} = $props();
  let profileImg = $state<any>();

  $effect(() => {
    if (!img ||inRegistration) return;
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
  <div class="border userPageImg">
    <img bind:this={profileImg} src={inRegistration && img ? img : userDefault} alt=""/>
  </div>
{:else if dimension == "medium"}
  <div class="border userPostImg">
    <img bind:this={profileImg} src={userDefault} alt=""/>
  </div>
{:else if dimension == "small"}
  <div class="border userMessageImg">
    <img bind:this={profileImg} src={userDefault} alt=""/>
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
