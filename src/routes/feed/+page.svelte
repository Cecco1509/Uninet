<script lang="ts">
  import { goto } from "$app/navigation";
  import { db, storage } from "$lib/firebase/firebase.client";
  import { addDoc, collection } from "firebase/firestore";
  import { MyUser } from "../../stores/userState.svelte";
  import { Timestamp } from "firebase/firestore";
  import { ref, uploadBytes } from "firebase/storage";
  import { uuidv4 } from "@firebase/util";
  import { DataBasaConn } from "../../stores/db.svelte";
  import { Post } from "../../stores/Post.svelte";
  import Posts from "../../Components/Posts.svelte";

  const userState = MyUser.getUser();
  const database = DataBasaConn.getDB();
  let homeFeed = database.homeFeed;
  let postText = $state("");
  let error = $state("");
  let avatar = $state<FileList | null>();
  let input = $state<HTMLInputElement>();

  async function uploadCurrentPhoto(): Promise<string> {
    if (!avatar || avatar.length == 0) return "";

    let url = "postImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      await uploadBytes(imageRef, avatar[0]);
    } catch (e) {
      url = "";
    }finally{
      input!.value = '';
    }

    return url;
  }

  async function handleSubmit() {
    if (!postText) return;

    try {
      await database.publishPost(postText, await uploadCurrentPhoto());
      console.log("Pubblicato");
    } catch (e) {
      error = (e as Error).message;
    }finally{
      postText = "";
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
  <input bind:this={input} bind:files={avatar} type="file" accept="image/*" />
  <button onclick={handleSubmit}>Pubblica</button>
</form>
{error}
<br />
<div onscroll={() => console.log(scroll)}>
  <br /><br /><br />
  {#key homeFeed.posts}
    <Posts feed={homeFeed} inUserPage={false} editable={false} />
  {/key}
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
