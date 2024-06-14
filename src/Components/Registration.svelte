<script lang="ts">
  import { db } from "$lib/firebase/firebase.client";
  import { doc, setDoc } from "firebase/firestore";
  import ProfileIcon from "./ProfileIcon.svelte";

  let { userID } : {userID: string} = $props();

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
        posts: 0,
      });
      window.location.href = "/users/" + username;
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div class="cnt">

  <span class="reg-text"> Completa la registrazione ed inizia ad usare Uninet! </span>
  <br>
  <div class="profile-img">
   <ProfileIcon img={""} inFeed={false}/>
  </div>
  
  <input type="file" name="profilePic" id="profileImg">

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
</div>



<style>

  .reg-text{
    font-size: 2em;
    padding-bottom: 20px;
    height: fit-content;
  }

  .cnt{
    width: 100%;
    min-height: 100dvh;
    padding: 20px 20px;
    display: block;
  }

  .profile-img{
    padding-top: 40px;
  }
</style>