<script>
    import { authHandlers, authStore } from "../stores/authStore";

    let register = true;
    let email = "";
    let password = "";
    let confirmPassword = "";

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

<form>
    <label>
        <input bind:value={email} type="email" placeholder="Email" />
    </label>
    <label>
        <input bind:value={password} type="text" placeholder="Password" />
    </label>
    {#if register}
        <label>
            <input
                bind:value={confirmPassword}
                type="text"
                placeholder="Confirm Password"
            />
        </label>
    {/if}
    <button on:click={handleSubmit}>Submit</button>
</form>

<style>
</style>
