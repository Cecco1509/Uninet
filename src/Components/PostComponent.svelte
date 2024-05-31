<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
  import {DataBasaConn} from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import type { Post } from "../stores/Post.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { uuidv4 } from "@firebase/util";

  let { post, inUserPage, editable } : {
    post: Post;
    inUserPage: boolean;
    editable: boolean;
  } = $props();

  let img = $state<any>();
  const user = MyUser.getUser();
  const db = DataBasaConn.getDB();
  let info = $state<UserInfo>();
  let editing = $state(false);
  let avatar = $state<FileList | null>();
  let input = $state<HTMLInputElement>();
  let text = $state(post.data.text);
  let commenting = $state(false);
  let commentText = $state("");

  async function handleSubmit() {
    if (!avatar || avatar.length == 0){
      await post.edit({text: text});
      editing = false;
      return;
    }

    const url = "postImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      await uploadBytes(imageRef, avatar[0]);
      await post.edit({img : url, text : text});
    } catch (e) {
      console.log("Errore", e);
    }finally{
      editing = false;
      input!.value = '';
    }

  }

  $effect(()=>{
    info;
    if(!post || !user.userInfo) return;

    if(post.data.createdBy == user.userInfo.Username){
      info = user.userInfo;
      return;
    }

    db.getUserInfo(post.data.createdBy).then((inf) => {
      info = inf;
    })
  })

  $effect(() => {
    if (!post || !post.data.img) return;

    const imageRef = ref(storage, post.data.img);
    console.log(post.data.img);
    getDownloadURL(imageRef)
      .then((url) => {
        img!.src = url;
      })
      .catch((error) => {
        console.log("errore", error.code);
      });
  });



  async function handleCommentSubmit(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if(!commentText) return;

    await post.publishComment(commentText);
    commenting = false;
    commentText = "";
  }
</script>

{#if post}
  <div class="post-container">
    {#if !inUserPage && info}
    <div class="profile-icon">
      <ProfileIcon img={info.img ? info.img : null} inFeed={!inUserPage}/>
      <span>Nome : {post?.data.createdBy}</span>
    </div>
    {/if}
    {#if post.data.img && !editing}
      <div class="img-container">
        <div class="image">
          <img bind:this={img} src="" alt="" />
        </div>
        <div class="loader">
          <LoadIcon />
        </div>
      </div>
    {:else if editing}
      <input bind:this={input} bind:files={avatar} type="file" accept="image/*" />
    {/if}
    <div class="numbers">
      <span>{post.data.likes} likes</span> <button class={post.liked ? "liked" : ""} onclick={() => {post.like()}}>Like</button>
      <span>{post.comments.length} comments</span>
    </div>
    {#if editable}
      <div class="actions">
        <button onclick={() => editing = !editing}>edit</button>
        <button onclick={() => db.deletePost(post.postId)}>delete</button>
      </div>
    {/if}
    <div class="description">
      {#if !editing}
        <span>{post.data.text}</span>
      {:else}
        <input type="text" bind:value={text}>
      {/if}
    </div>
    {#if editing}
      <button onclick={handleSubmit}>INVIA</button>
    {/if}
    <br>
    <div class="comments">
      {#each post.comments as comment}
        <div class="comment">
          <span>{comment.data.toDate()}</span><br>
          <span>{comment.userID}</span><br>
          <span>{comment.testo}</span>
        </div>
      {/each}
      {#if !commenting}
        <button onclick={() => commenting = true}>Inserisci commento</button>
      {:else}
        <input bind:value={commentText} type="text">
        <button onclick={handleCommentSubmit}>invia</button>
      {/if}
    </div>

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
    margin: 50px 0px 30px 0px;
    opacity: 0;
    padding: 0px;
    width: 100%;
    height: fit-content;
    animation: slideInPost ease-in-out 1s;
    animation-fill-mode: forwards;
  }

  @keyframes slideInPost {
    0% {
      margin-top: 50px;
      opacity: 0;
    }
    100% {
      opacity: 1;
      margin-top: 0px;
    }
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
        object-fit: contain;
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
