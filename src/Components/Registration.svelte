<script lang="ts">
  import { signOut } from "firebase/auth";
  import { auth, db } from "$lib/firebase/firebase.client";
  import type { FirebaseError } from "firebase/app";
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import { getUserInfo, getUserPosts } from "../stores/db";
  import Post from "./Post.svelte";
  import type { Script } from "svelte/compiler";
  import { setDoc, doc } from "firebase/firestore";

  let { userID } = $props<{
    userID: string;
  }>();

  let username = $state("");
  let nome = $state("");
  let cognome = $state("");
  let data = $state("");

  const handleSubmit = async (e: Event) => {
    try {
      await setDoc(doc(db, "Users", userID), {
        Nome: nome,
        Cognome: cognome,
        birthday: {
          seconds: 0,
          nanoseconds: 0,
        },
        img: "",
        Bio: "",
        seguiti: 0,
        Followers: 0,
        Username: username,
        private: false,
      });
      window.location.href = "/users/" + username;
    } catch (e) {
      console.log(e);
    }
  };
</script>

<form>
  <label>
    <input bind:value={username} type="text" placeholder="Username" />
  </label>
  <label>
    <input bind:value={nome} type="text" placeholder="Nome" />
  </label>
  <label>
    <input bind:value={cognome} type="text" placeholder="Cognome" />
  </label>
  <label>
    <input bind:value={data} type="date" placeholder="Data di nascita" />
  </label>
  <button onclick={handleSubmit}>Completa registrazione</button>
</form>
