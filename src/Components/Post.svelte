<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { doc } from "firebase/firestore";
  import { getDownloadURL, ref } from "firebase/storage";

  let { post } = $props<{ post: PostType }>();
  let img = $state<any>();

  $effect(() => {
    if (!post.img) return;

    const imageRef = ref(storage, post.img);
    getDownloadURL(imageRef)
      .then((url) => {
        img!.src = url;
      })
      .catch((error) => {
        console.log(error.code);
      });
  });
</script>

<div>
  <img src="" alt="profile_pc" />
  <span>{post.userID}</span>
  <img bind:this={img} src="" alt="" />
  <span>{post.text}</span>
  <div>{post.likes} {post.comments}</div>
  <span></span>
</div>

<style>
  img {
    width: 100%;
  }
</style>
