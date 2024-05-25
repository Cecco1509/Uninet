<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { doc } from "firebase/firestore";
  import { getDownloadURL, ref } from "firebase/storage";
  import { getUserInfo } from "../stores/db";
  import viewport from "./useViewportActions";
  import Loading from "./Loading.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";

  let { post, inUserPage, editable } : {
    post: PostSchema;
    inUserPage: boolean;
    editable: boolean;
  } = $props();

  let img = $state<any>();
  let userInfo = $state<UserInfo>();

  $effect(() => {
    if (!post || !inUserPage) return;
    if (!post.createdBy) return;

    getUserInfo(post.createdBy)
      .then((userInf) => {
        userInfo = userInf as UserInfo;
      })
      .catch();
  });

  $effect(() => {
    if (!post || !inUserPage) return;
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

{#if post}
  <div>
    {#if !inUserPage}
      <ProfileIcon img={userInfo?.img ? userInfo.img : null} />
      <span>Nome : {post?.createdBy}</span>
    {/if}
    <img bind:this={img} src="" alt="" />
    <span>{post.text}</span>
    <div>{post.likes} {post.comments}</div>
    <span></span>
  </div>
{/if}

<style>
  img {
    width: 100%;
  }
</style>
