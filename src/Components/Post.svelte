<script lang="ts">
  import { db, storage } from "$lib/firebase/firebase.client";
  import { doc } from "firebase/firestore";
  import { getDownloadURL, ref } from "firebase/storage";
  import { deletePost, getUserInfo, updatePost } from "../stores/db";
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
  <div class="post-container">
    {#if !inUserPage}
    <div class="profile-icon">
      <ProfileIcon img={userInfo?.img ? userInfo.img : null} />
      <span>Nome : {post?.createdBy}</span>
    </div>
    {/if}
    {#if post.img}
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
      <span>{post.likes} likes</span>
      <span>{post.comments} comments</span>
    </div>
    {#if editable}
      <div class="actions">
        <button onclick={() => updatePost(post.postID, post.userID)}>edit</button>
        <button onclick={() => deletePost(post.postID, post.userID)}>delete</button>
      </div>
    {/if}
    <div class="description">
      <span>{post.text}</span>
    </div>
    <br>
    <div class="comments">Commenti</div>
  </div>
{/if}

<style>

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

    :first-child{
      margin-top: 10px;
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
      }
    }

    .loader{
      z-index: 1;
      margin: 0px;
      width: 60vw;
      height: 400px;
      padding: 0px;
      transform: translateY(-100%);
      position:absolute;
    }

  }
  

</style>
