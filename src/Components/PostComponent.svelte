<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref } from "firebase/storage";
  import {DataBasaConn, updatePost } from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import type { Post } from "../stores/Post.svelte";

  let { post, inUserPage, editable } : {
    post: Post;
    inUserPage: boolean;
    editable: boolean;
  } = $props();

  let img = $state<any>();
  const db = DataBasaConn.getDB();
  let info = $state<UserInfo>();

  $effect(()=>{
    if(info || !post) return;
    db.getUserInfo(post.data.createdBy).then((inf) => {
      info = inf;
    })
  })

  $effect(() => {
    if (!post || !post.data.img) return;

    const imageRef = ref(storage, post.data.img);
    getDownloadURL(imageRef)
      .then((url) => {
        img!.src = url;
      })
      .catch((error) => {
        console.log("errore", error.code);
      });
  });

</script>

{#if post}
  <div class="post-container">
    {#if !inUserPage && info}
    <div class="profile-icon">
      <ProfileIcon img={info.img ? info.img : null} />
      <span>Nome : {post?.data.createdBy}</span>
    </div>
    {/if}
    {#if post.data.img}
      <div class="img-container">
        <!--  -->
        <div class="image">
          <img bind:this={img} src="" alt="" />
        </div>
        <div class="loader">
          <LoadIcon />
        </div>
      </div>
    {/if}
    <div class="numbers">
      <span>{post.data.likes} likes</span> <button class={post.liked ? "liked" : ""} onclick={() => {post.like()}}>Like</button>
      <span>{post.comments} comments</span>
    </div>
    {#if editable}
      <div class="actions">
        <button onclick={() => console.log("ci si prova")}>edit</button>
        <button onclick={() => db.deletePost(post.postId)}>delete</button>
      </div>
    {/if}
    <div class="description">
      <span>{post.data.text}</span>
    </div>
    <br>
    <div class="comments">Commenti</div>

  </div>
{/if}

<style>

  .liked{
    background-color: red;
  }

  .numbers{
    margin-top: 10px;
    margin-bottom:10px;
    span{
      font-size: 2em;
    }
  }

  .post-container{
    height: auto;
    display: block;
    margin: 0px 0px 30px 0px;
    padding: 0px;
    width: 100%;
    height: fit-content;

  }

  .img-container{
    display: block;
    height: 400px;
    width: 100%;
    margin: 0px;
    padding: 0px;

    .image{
      position: relative;
      z-index: 10;
      background-color: rgba(255, 255, 255, 0.122);
      height: 100%;
      width: inherit;
      border: 0px;
      margin: 0px;
      padding: 0px;

      img{
        position: relative;
        height: 100%;
        width: inherit;
      }
    }

    .loader{
      z-index: 1;
      margin-top: 10px;
      width: 60vw;
      height: 400px;
      padding: 0px;
      transform: translateY(-100%);
      position:absolute;
    }

  }
  

</style>
