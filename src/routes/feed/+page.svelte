<script lang="ts">
  import { goto } from "$app/navigation";
  import { db, storage } from "$lib/firebase/firebase.client";
  import { addDoc, collection, onSnapshot } from "firebase/firestore";
  import { createUser } from "../../stores/userState.svelte";
  import { doc, setDoc, Timestamp } from "firebase/firestore";
  import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
  import { uuidv4 } from "@firebase/util";
  import Post from "../../Components/Post.svelte";
  import { getUserFeed } from "../../stores/db";

  const userState = createUser();
  let postText = $state("");
  let error = $state("");
  let avatar = $state<FileList | null>();
  let postsArr = $state<PostSchema[]>([]);

  $effect(() => {
    if (userState.isLoading) return;
    if (!userState.userInfo) {
      window.location.href = "/users";
      return;
    }
    getUserFeed(userState.userInfo.Username, 0)
      .then((posts) => {
        postsArr = posts;
      })
      .catch();
  });

  function uploadCurrentPhoto(): string {
    if (!avatar || avatar.length == 0) return "";

    let url = "postImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      uploadBytes(imageRef, avatar[0]).then((snapshot) => {
        console.log("Uploaded a blob or file!");
      });
    } catch (e) {
      url = "";
    }

    return url;
  }

  async function handleSubmit() {
    if (!postText) return;

    try {
      await addDoc(collection(db, "Posts"), {
        data: Timestamp.fromDate(new Date()),
        text: postText,
        likes: 0,
        comments: 0,
        img: uploadCurrentPhoto(),
        userID: userState.user!.uid,
        createdBy: userState.userInfo?.Username,
      });
      console.log("Pubblicato");
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

Feed {userState.user?.email}

<button onclick={() => goto(`/users/${userState.userInfo?.Username}`)}
  >User</button
>

<form>
  <textarea bind:value={postText}></textarea>
  <input bind:files={avatar} type="file" accept="image/*" />
  <button onclick={handleSubmit}>Pubblica</button>
</form>
{error}
<br />
<div onscroll={() => console.log(scroll)}>
  <br /><br /><br />
  {#each postsArr as post}
    <Post {post} inUserPage={false} editable={false} />
  {/each}
</div>

<!-- Cose da fare qui

    - Far vedere i post della gente
    - Box per creare un post (Ora)
    - barra in alto?
    - barra in basso? (✔️)
    - Barra laterale?

-->

<style>
  * {
    max-width: 100%;
  }
</style>
