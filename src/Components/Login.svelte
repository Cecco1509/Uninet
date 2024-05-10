<script lang="ts">
  import logo from "$lib/assets/hero.png";
  import { FirebaseError } from "firebase/app";
  import { authStore } from "../stores/authStore.svelte";

  let register = $state(false);
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state<string | null>("");

  async function handleSubmit() {
    if (!email || !password || (register && !confirmPassword)) {
      return;
    }

    if (register && password === confirmPassword) {
      try {
        await authStore.signup(email, password);
      } catch (e) {
        error = (e as FirebaseError).code;
      }
    } else {
      try {
        await authStore.login(email, password);
      } catch (e) {
        error = (e as FirebaseError).code;
      }
    }

    if (authStore.currentUser) {
      window.location.href = "/feed";
    }
  }
</script>

<div class="login-container">
  <div class="form-box-container">
    {#if error}
      {error}
    {/if}
    <div class="form-container">
      <form>
        <label>
          <input bind:value={email} type="email" placeholder="Email" />
        </label>
        <label>
          <input bind:value={password} type="password" placeholder="Password" />
        </label>
        {#if register}
          <label>
            <input
              bind:value={confirmPassword}
              type="password"
              placeholder="Confirm Password"
            />
          </label>
        {/if}
        <br />
        <button onclick={handleSubmit}>
          {#if register}
            Sign Up
          {:else}
            Log in
          {/if}
        </button>
      </form>
    </div>
    <div class="or">or</div>
    {#if register}
      <p>
        Sei già iscritto? Esegui il <span onclick={() => (register = false)}
          >log in!</span
        >
      </p>
    {:else}
      <p>
        Non hai un account? <span onclick={() => (register = true)}
          >Registrati!</span
        >
      </p>
    {/if}
  </div>
  <div class="hero-box">
    <img src={logo} alt="logo" />
  </div>
</div>

<style>
  .login-container {
    width: 100%;
    display: flex;
    height: auto;
    background-color: rgba(33, 227, 218, 1);
    border-radius: 30px;
    box-shadow: 0px 0px 2px teal;
  }

  .hero-box {
    width: 50%;
    height: 80svh;
    background-color: rgba(255, 255, 255, 0.2);
    /* backdrop-filter: blur(10px); */
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0px 30px 30px 0px;
  }

  img {
    height: 50%;
    /* width: 300px; */
  }

  .form-box-container {
    background-color: #393e41;
    border-radius: 30px 0px 0px 30px;
    width: 50%;
    height: 80svh;
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 70%;
  }

  input {
    outline: none;
    width: 100%;
    margin: 5px 0px;
    height: 5vh;
    border-radius: 10px;
    border: 2px solid #28736f;
    padding: 0px 5px;
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
  }

  button:hover {
    background-color: #20e1d0;
    color: #393e41;
    box-shadow: 0px 0px 6px #21e3da;
  }

  h1 {
    align-self: flex-start;
    padding-left: 25%;
    padding-bottom: 10%;
    /*font-size: 50px;       */
  }

  .or {
    display: flex;
    color: white;
    width: 50%;
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
    width: 50%;
  }

  span {
    color: #e6c960;
    cursor: pointer;
    text-decoration: underline;
  }

  @media only screen and (max-width: 600px) {
    .form-box-container {
      text-align: center;
      width: 100%;
      height: auto;
      background-color: transparent;
      height: 100svh;
    }

    h1 {
      padding-bottom: 10%;
      /*font-size: 4em;       */
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
