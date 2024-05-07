<script>
    import { authHandlers, authStore } from "../stores/authStore";

    let register = $state(false);
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    async function handleSubmit() {
        if (!email || !password || (register && !confirmPassword)) {
            return;
        }

        if (register && password === confirmPassword) {
            try {
                await authHandlers.signup(email, password);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                await authHandlers.login(email, password);
            } catch (err) {
                console.log(err);
            }
        }
        if ($authStore.currentUser) {
            window.location.href = "/feed";
        }
    }
</script>

<div class="form-box-container">
    {#if register}
        <h1>Registrati</h1>
    {:else}
        <h1>Entra</h1>
    {/if}
    <div class="form-container">
        <form>
            <label>
                <input bind:value={email} type="email" placeholder="Email" />
            </label>
            <label>
                <input
                    bind:value={password}
                    type="password"
                    placeholder="Password"
                />
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
                    Sign up
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

<style>
    .form-box-container {
        background-color: #393e41;
        border-radius: 10px;
        width: 30dvw;
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
        width: 50%;
    }

    input {
        outline: none;
        width: 100%;
        margin: 5px 0px;
        height: 5vh;
        border-radius: 10px;
        border: 2px solid #28736f;
        padding: 0px 5px;
        font-size: 16px;
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
        font-size: 20px;
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
        font-size: 50px;
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
            width: 100%;
            height: auto;
            color: transparent;
            height: 100svh;
        }
    }
</style>
