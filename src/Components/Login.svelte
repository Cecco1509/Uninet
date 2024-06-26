<script lang="ts">
  import logo from "$lib/assets/hero.png";
  import { auth } from "$lib/firebase/firebase.client";
  import { FirebaseError } from "firebase/app";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  } from "firebase/auth";
  import LoadIcon from "./LoadIcon.svelte";
  import blurryGradient from "../lib/assets/blurry-gradient-haikei.png"
  import Registration from "./Registration.svelte";
  import { MyUser } from "../stores/userState.svelte";
  import { MenuStore, Positions } from "../stores/Menu.svelte";

  const user = MyUser.getUser();
  let register = $state(false);
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state<string | null>("");
  let submitted = $state<boolean>(false);
  let completing = $state<boolean>(false);
  let steps = $state<number>(0)
  let uid = $state("");

  MenuStore.getMenu().currentSection = Positions.Login;

    $effect(() => {
      if(user.isLoading) return

      completing = !user.userInfo && user.user ? true : false;
      console.log(completing)
    })

  async function handleSubmit() {
    if (!email || !password || (register && !confirmPassword)) {
      submitted = false;
      return;
    }

    if (register && password === confirmPassword) {
      try {
        const user = await createUserWithEmailAndPassword(auth, email, password)
        completing = true;
        uid = user.user.uid;
      } catch (e) {
        error = (e as FirebaseError).code;
        submitted = false;
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        error = (e as FirebaseError).code;
        submitted = false;
      }
    }
  }
</script>

<div class="login-container">
  <div class="hero-box" style="background-image: url({blurryGradient})">
    <img src={logo} alt="logo" />

    <span class="hero-span">Entra in Uninet, il social per studenti!</span>
  </div>
  <div class="form-box-container">
    {#if error}
      {error}
    {/if}
    <div class="form-title">
      <span>
        {#if !register && !completing}
          Login
        {:else}
          Registrati
        {/if}
      </span>
    </div>
    {#if !completing}
      
        <div class="form-container">
          <form>
            <div class="input-wrapper">
              <label for="email" > Email </label><br>
              <input bind:value={email} id="email" type="email" placeholder="example@domain.com" />
            </div>
          
            <div class="input-wrapper">
              <label for="pass">Password</label>
            <input bind:value={password} type="password" id="pass" placeholder="••••••••••••" />
            </div>
            
            {#if register}
              <div class="input-wrapper">
                <label for="conf-pass">Conferma password</label>
                <input bind:value={confirmPassword} type="password" id="conf-pass" placeholder="••••••••••••"/>
              </div>  
            {/if}

            <button
              onclick={() => {
                submitted = true;
                handleSubmit();
              }}
            >
              {#if submitted}
                <LoadIcon />
              {:else if register}
                Crea un account
              {:else}
                Accedi
              {/if}
            </button>
          </form>
        </div>
        <div class="options">
          <div class="or">or</div>
            {#if register}
              <p>
                Sei già iscritto? Esegui il <button class="no-btn" onclick={() => (register = false)}>
                  <span>log in</span>
                </button>
              </p>
            {:else}
              <p>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                Non hai un account? <button class="no-btn" onclick={() => (register = true)}><span >
                  Registrati</span></button>
              </p> 
              
            {/if}
        </div>
    {:else}
      {#if user.user || uid}
        <Registration userID={user.user ? user.user.uid : uid} />
      {/if}
    {/if}
    </div>
</div>

<style>

  .no-btn{
    border:none;
    padding: 0px;
    background-color: transparent;
    height: auto;
    width: auto;
    display: inline;

    &:hover{
      background-color: transparent;
      box-shadow: none;
    }
  }

  .options{
    width: 75%;
    margin-left: 12.5%;
  }

  label{
    padding-left: 10px;
    opacity: 0.5;
  }

  .input-wrapper{
    padding: 2% 0px;
  }

  .login-container {
    width: 100%;
    display: flex;
    height: 80dvh;
    background-color: rgba(88, 88, 88, 0.232);
    border-radius: 20px;
    padding: 15px;
  }

  .hero-box {
    width: 60%;
    height: 100%;
    /* background-color: #21e3d974; */
    /* backdrop-filter: blur(10px); */
    background-repeat: no-repeat;
    background-clip: padding-box;
    background-size: cover;
    border-radius: 15px;
  }

  img {
    margin-top: 5%;
    margin-left: 5%;
    width: 10%;
    opacity: 1 !important;
    /* width: 300px; */
  }

  .form-box-container {
    background-color:transparent;
    border : none;
    width: 40%;
    padding: 5% 15px 5% 30px;
    height: 100%;
    display: block;
  }

  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0px 30px;
  }

  input {
    outline: none;
    width: 100%;
    margin: 5px 0px;
    height: 5vh;
    box-sizing: border-box !important;
    border-radius: 10px;
    background-color: #393e41;
    color: white;
    border: 2px solid #28736f;
    padding: 0px 10px;
    /*font-size: 16px;       */
    transition: all 0.5s;

    &:last-child {
      margin-bottom: 10px;
    }

    &:focus {
      border-color: #21e3da;
      box-shadow: 0px 0px 6px #21e3da;
    }
  }

  button {
    border-radius: 10px;
    background-color: transparent;
    cursor: pointer;
    height: 5vh;
    border-color: #21e3da;
    border: 2px solid #21e3da;
    margin: 5px 0px;
    width: 100%;
    background-color: rgba(33, 227, 218, 0.1);
    /*font-size: 20px;       */
    color: #21e3da;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    background-color: #20e1d0;
    color: #393e41;
    box-shadow: 0px 0px 6px #21e3da;
  }

  .or {
    display: flex;
    color: white;
    width: 100%;
    justify-content: center;
    align-items: center;
    margin: 30px 0px;

    &:after,
    &:before {
      height: 1px;
      content: "";
      margin: 0px 5px;
      display: block;
      flex: 1;
      background-color: grey;
    }
  }

  p {
    width: 100%;
    color: #4d5356;
  }

  span {
    color: #e6c960;
    cursor: pointer;
    text-decoration: underline;
  }

  .hero-span{
    color: white;
    text-decoration: none;
    display: block;
    padding-left: 5%;
    width: 60%;
    margin-top: 20%;
    font-size: 3em;
    font-weight: 600;
    letter-spacing: -1.2px;
    cursor: auto;
  }

  .form-title{

    height: 10%;
    margin-bottom: 10%;
    text-align: center;

    span{
      color: white;
      text-decoration: none !important;
      outline: none;
      cursor: auto;
      font-size: 3em;
    }
    
  }

  @media only screen and (max-width: 600px) {
    .form-box-container {
      text-align: center;
      width: 100%;
      height: auto;
      background-color: transparent;
      height: 100svh;
    }

    button {
      height: 7vh;
    }

    input {
      height: 7vh;
      /*font-size: 20px;       */
    }

    .form-container {
      width: 100%;
      height: auto;
      background-color: transparent;
    }

    .or {
      width: 100%;
    }

    p {
      width: 100%;
    }
  }
</style>
