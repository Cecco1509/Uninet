<script lang="ts">
  import { goto } from "$app/navigation";
  import { db, storage } from "$lib/firebase/firebase.client";
  import { addDoc, collection, onSnapshot } from "firebase/firestore";
  import { createUser } from "../../stores/userState.svelte";
  import { doc, setDoc, Timestamp } from "firebase/firestore";
  import { getUserInfo } from "../../stores/userInfo.svelte";
  import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
  import { uuidv4 } from "@firebase/util";
  import Post from "../../Components/Post.svelte";

  const userState = createUser();
  let postText = $state("");
  let error = $state("");
  let avatar = $state<FileList | null>();
  let postsArr = $state<Array<PostType>>([]);

  $effect(() => {
    const unsubscribe = onSnapshot(collection(db, "Posts"), (queryDocs) => {
      postsArr = [];
      queryDocs.forEach((doc) => {
        postsArr.push(doc.data() as PostType);
      });
    });
    return unsubscribe;
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
      });
      error = "SI GODE";
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<svelte:head>
  <title>Uninet | Feed</title>
</svelte:head>

Feed {userState.user?.email}

<button onclick={() => goto(`/users/${userState.user?.uid}`)}>User</button>

<form>
  <textarea bind:value={postText}></textarea>
  <input bind:files={avatar} type="file" accept="image/*" />
  <button onclick={handleSubmit}>Pubblica</button>
</form>
{error}
<br />

<br /><br /><br />
{#each postsArr as post}
  <Post {post} />
{/each}

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
