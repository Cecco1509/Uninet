<script lang="ts">
  import { storage } from "$lib/firebase/firebase.client";
  import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
  import {DataBasaConn} from "../stores/db.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import ProfileIcon from "./ProfileIcon.svelte";
  import type { Post } from "../stores/Post.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { uuidv4 } from "@firebase/util";
  import { goto } from "$app/navigation";
  import LikeIcon from "./Icons/LikeIcon.svelte";
  import CommentIcon from "./Icons/CommentIcon.svelte";
  import EditIcon from "./Icons/EditIcon.svelte"
  import DeleteIcon from "./Icons/DeleteIcon.svelte";
  import CheckIcon from "./Icons/CheckIcon.svelte";
  import CanceIcon from "./Icons/CanceIcon.svelte";

  let { post, inUserPage, editable } : {
    post: Post;
    inUserPage: boolean;
    editable: boolean;
  } = $props();

  let img = $state<HTMLImageElement>();
  const user = MyUser.getUser();
  const db = DataBasaConn.getDB();
  let info = $state<UserInfo>();
  let editing = $state(false);
  let avatar = $state<FileList | null>();
  let input = $state<HTMLInputElement>();
  let text = $state(post.data.text);
  let commenting = $state(false);
  let commentText = $state("");
  let sendingComment = $state(false);
  let deleting = $state(false);

  async function handleSubmit() {

    if(deleting) {
      deleting = false;
      db.deletePost(post.postId);
      return;
    }

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
    if (!post || !post.data.img || !img) return;
    img.src = "";

    const imageRef = ref(storage, post.data.img);
    getDownloadURL(imageRef)
      .then((url) => {
        img!.src = url;
        console.log("hey");
      })
      .catch((error) => {
        console.log("errore", error.code);
      });
  });

  function calcExpiredTime(date2 : Date) : string {
    const date1 : Date = new Date();

    let diffTime = ((date1 - date2) / (1000 * 60 * 60 * 24));
    let word = " anni fa"
    if(diffTime > 365) return Math.floor(diffTime/365)+" anni fa";
    if(diffTime > 30) return Math.floor(diffTime/30)+" mesi fa";
    if(diffTime > 7) return Math.floor(diffTime/7)+" settimane fa";
    if(diffTime > 2) return Math.floor(diffTime)+" giorni fa";

    if(diffTime < 1) {
      diffTime *= 24;
      word = " ore fa"
    }

    if (diffTime < 1) {
      diffTime *= 60
      word = " minuti fa"
    }

    if (diffTime < 1) return "adesso";

    return ""+Math.floor(diffTime)+word;
  }

  async function handleCommentSubmit() {
    sendingComment = true;
    console.log("prova Commentato");
    if(!commentText) return;
    await post.publishComment(commentText);
    console.log("Commentato");
    commentText = "";
    commenting = false;
    sendingComment = false;
  }


  function handleCommentRequest() {
    post.loadComments();
  }
</script>

{#if post}
  <div class="post-container">
    {#if !inUserPage && info}
    <div class="profile-icon">
      <ProfileIcon img={info.img ? info.img : null} inFeed={!inUserPage}/>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span class="user-link" onclick={() => goto("/users/"+post.data.createdBy)}>{post.data.createdBy}</span>
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
    {#if !post.data.img}
      {#if !editing}
        <div class="pensiero">
          <span>{post.data.text}</span>
        </div>
      {:else}
        <textarea bind:value={text} class="pensiero input-pensiero">{post.data.text.trim()}</textarea>
      {/if}
    {/if}
    <div class="numbers">
      <div class="lk-cnt">
        <button class="heart-btn" onclick={() => {post.like()}}>
          <LikeIcon liked={post.liked}/>
        </button>
        <span>{post.data.likes}</span>
      </div>
      <div class="cmt-cnt">
        <button class="heart-btn">
          <CommentIcon />
        </button>
        <span>{post.data.comments}</span>
      </div>
      <span class="date">{calcExpiredTime(post.data.data.toDate())}</span>
      {#if editable}
        <div class="actions">
          {#if !editing && !deleting}
            <button class="heart-btn" onclick={() => editing = !editing}>
              <EditIcon />
            </button>
            <button class="heart-btn" onclick={() => deleting = true}>
              <DeleteIcon />
            </button>
          {:else}
            <button class="heart-btn" onclick={() => {handleSubmit();}}>
              <CheckIcon />
            </button>
            <button class="heart-btn" onclick={() => editing ? editing = false : deleting = false}>
              <CanceIcon />
            </button>
          {/if}
          
        </div>
      {/if}
    </div>
    {#if post.data.img}
      <div class="description">
        {#if !editing}
          <span>{post.data.text}</span>
        {:else}
          <textarea class="description-edit" bind:value={text}></textarea> 
        {/if}
      </div>
    {/if}
    <br>

    <div class="pub-cmt-cnt">
      <textarea onfocusin={() => {commenting = true; sendingComment = true}} onfocusout={() => sendingComment = false}  class="cmt-input" bind:value={commentText} placeholder="Inserisci un commento..."></textarea>

      <button class="send-cmt-btn" onclick={() => handleCommentSubmit()}>
        Invia
      </button>
    </div>
    <div class="comments">
      {#each post.comments as comment}
        <div class="comment">
          <span>{comment.userID} • {calcExpiredTime(comment.data.toDate())}</span><br>
          <span class="text">{comment.testo}</span>
        </div>
      {/each}
      {#if !post.fetchedAllComments}
        <button class="loadComments" onclick={handleCommentRequest}>carica altri commenti</button>
      {/if}
    </div>

  </div>
{/if}

<style>

  .description-edit{
    width: calc((100%));
    border: 1px solid #e6c96057;
    background-color: transparent;
    outline: none;
    transition: all 0.5s;
    resize: none;
    height: 100px;
    color: white;
    border-radius: 5px;
    padding: 10px;
    transition: all 0.5s;

    &:focus{
        border: 1px solid #e6c960;
        height: 150px;
      }
  }

  .pub-cmt-cnt{
    
    .cmt-input{
      border: none;
      border: 1px solid #e6c96057;
      background-color: transparent;
      outline: none;
      color: white;
      transition: all 0.5s;
      margin: 0px 16px 0px 16px;
      resize: none;
      width: calc((100% - 32px) - 110px);
      height: 50px;
      padding: 10px;
      border-radius: 5px;

      &:focus{
        border: 1px solid #e6c960;
        height: 150px;
      }

    }

    button{
      display: inline-block;
      width: 100px;
      transform: translateY(calc(-100% - 4px));
      margin-top: 0px !important;
      margin-bottom: 0px !important;
      height: 50px !important;
    }
  }

  .description{
    margin-left: 16px;
    width: calc(100% - 32px);
    font-size: 1.5em;
    color: rgba(255, 255, 255, 0.917);
  }

  .loadComments{
    border: none;
    background-color: transparent;
    color: #313436;
    width: 100%;
    text-align: center;
    padding-top: 10px;
    cursor: pointer;
    transform: translateY(10px);
  }

  .comments{
    transform: translateY(-25px);
    margin-top: 20px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .comment{
    border: 1px solid #393e41;
    border-radius: 5px;
    margin-top: 5px;
    padding: 5px;
    opacity: 0;
    animation: fade-in 1s forwards;

    .text{
      padding-left: 5px;
    }
  }

  @keyframes fade-in{
    0%{
      opacity: 0;
    }
    100%{
      opacity: 1;
    }
  }

  .send-cmt-btn{
    margin-top: 5px;
    width: 100px;
    margin-left: calc((100% - 100px) - 16px);
    border: 1px solid #e6c960;
    padding: 10px;
    border-radius: 15px;
    font-size: 1.3em;
    background-color: transparent;
    color: #e6c960;
    transition: all 1s;

    &:hover{
      cursor: pointer;
      background-color: #e6c960;
      color: black;
    }
  }

  .actions{
    display: flex;
    gap: 10px;
    padding-left: 10px;
  }

  .pensiero{
    width: 100%;
    border-radius: 5px;
    border: 1px solid #393e41;
    padding: 15px;
    height: max-content;
    margin-top: 3vh;
    font-size: 1.5em;
  }

  .input-pensiero{
    height: 300px;
    background-color: transparent;
    color: white;
    resize: none;
    outline: none;
    transition: all 0.5s;

    &:focus{
      border-color: #21e3d97e;
    }
  }

  .profile-icon{
    display: flex;
    width: 100%;

    span{
      height: max-content;
      align-self: center;
      padding: 0px 0px 0px 10px;
    }

    .user-link{
      font-size: 1.4em;
      transition: all 0.3s;

      &:hover{
        text-decoration: underline;
        cursor: pointer;
        color: #e6c960;
      }
    }
  }

  .date{
    opacity: .8;
    width: 100%;
    font-size: 1.2em !important;
    align-self: center;
    text-align: end;
  }


  .heart-btn{
    border: none;
    background: none;
    height: 25px !important;
    width: 25px !important;
    cursor: pointer;
  }

  .numbers{
    width: 100%;
    padding: 0px 16px 0px 16px;
    margin-top: 10px;
    margin-bottom:10px;
    display: flex;

    span{
      font-size: 1.4em;
    }
  }

  .lk-cnt{
    display: flex;
    gap: 5px;
  }

  .cmt-cnt{
    display: flex;
    padding-left: 20px;
    gap: 5px;
  }

  .post-container{
    min-height: 300px;
    height: auto;
    display: block;
    padding: 10px;
    opacity: 0;
    width: 100%;
    transition: all 0.3s;
    height: fit-content;
    animation: slideInPost ease-in-out 1s;
    animation-fill-mode: forwards;
  }

  @keyframes slideInPost {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
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
        z-index: 20;
      }
    }

    .loader{
      z-index: 1;
      width: calc(50dvw - 32px);
      height: 400px;
      padding: 0px;
      transform: translateY(-100%);
      position:absolute;
    }

  }
  

</style>
