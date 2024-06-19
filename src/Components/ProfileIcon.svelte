<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import userDefault from "$lib/assets/userDefault.png";

  let { img, inFeed, inRegistration } : { img: string | null; inFeed : boolean; inRegistration? : boolean | undefined } = $props();
  let profileImg = $state<any>();

  $effect(() => {
    if (!img || !profileImg || inRegistration) return;

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

<div class={inFeed ? "border userPostImg" : "border userPageImg"}>
  <img bind:this={profileImg} src={inRegistration && img ? img : userDefault} alt=""/>
</div>


<style>

  .border{
    background: linear-gradient(white, white) padding-box,
              linear-gradient(60deg, #ffffff8d, #21d2b5) border-box;
    border-radius: 50px;
    border: 2px solid transparent;
    /* border-image: linear-gradient(to right, #ffffff8d, #21d2b5) 1; */
  }

  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
    background-size: cover;
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
</style>
