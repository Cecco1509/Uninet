<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import userDefault from "$lib/assets/userDefault.png";

  let { img } = $props();
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
      console.log("Unlucky");
    }
  });
</script>

<img bind:this={profileImg} src={userDefault} alt="" />

<style>
  img {
    height: 150px;
    width: 150px;
    border-radius: 50%;
  }
</style>
