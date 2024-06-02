<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import userDefault from "$lib/assets/userDefault.png";

  let { img, inFeed } : { img: string | null; inFeed : boolean } = $props();
  let profileImg = $state<any>();

  $effect(() => {
    if (!img || !profileImg) return;

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

<img class={inFeed ? "border userPostImg" : "border userPageImg"} bind:this={profileImg} src={userDefault} alt="" />

<style>

  .border{
    border: 2px solid #393e41;
  }

  .userPageImg {
    height: 150px;
    width: 150px;
    border-radius: 50%;
  }

  .userPostImg {
    height: 70px;
    width: 70px;
    border-radius: 50%;
  }
</style>
