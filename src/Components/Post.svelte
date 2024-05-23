<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { doc } from "firebase/firestore";
  import { getDownloadURL, ref } from "firebase/storage";
  import { UserAuth } from "../stores/authStore.svelte";
  import { getUserInfo } from "../stores/db";
  import viewport from "./useViewportActions";
  import Loading from "./Loading.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let { post } = $props<{ post: PostSchema }>();
  let img = $state<any>();
  let userInfo = $state<any>();
  let isInView: boolean;
  const options = {};

  $effect(() => {
    if (!post.createdBy) return;

    getUserInfo(post.createdBy)
      .then((userInf) => {
        userInfo = userInf as UserInfo;
        console.log(userInf);
      })
      .catch();
  });

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

<div
  use:viewport
  onenterViewport={() => console.log("enter!")}
  onexitViewport={() => console.log("exit!")}
>
  <ProfileIcon img={userInfo?.img} />
  <span>Nome : {post?.createdBy}</span>
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
