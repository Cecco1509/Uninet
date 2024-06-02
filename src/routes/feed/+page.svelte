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
  <div class="publish">
    <br>
    <h1>Feed</h1>
    <br>
    <br>
    <textarea placeholder="Che succede?" bind:value={postText}></textarea>
    <div class="inp-spacer">
      <input bind:this={input} bind:files={avatar} type="file" accept="image/*" />
    </div>
    <button onclick={handleSubmit}>Pubblica</button>
  </div>
  <div>
    <hr>
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

  .inp-spacer{
    margin: 10px 0px;
  }

  .publish{
    padding: 10px;
  }

  textarea{
    resize: none;
    width: 100%;
    height: 150px;
    background-color: transparent;
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.201);
    border-radius: 5px;
    color: white;
    font-size: 2em;
    padding: 10px;
    transition: all 0.5s;

    &:focus{
      border: 1px solid #e6c960;
    }
  }

  button{
    border-radius: 10px;
    background-color: transparent;
    cursor: pointer;
    width: 100px;
    height: 50px;
    border-color: #21e3da;
    border: 2px solid #21e3da;
    margin: 5px 0px;
    background-color: rgba(33, 227, 218, 0.1);
    /*font-size: 20px;       */
    color: #21e3da;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: calc(100% - 100px);
  }

  button:hover {
    background-color: #20e1d0;
    color: #393e41;
    box-shadow: 0px 0px 6px #21e3da;
  }

  * {
    max-width: 100%;
  }
</style>
