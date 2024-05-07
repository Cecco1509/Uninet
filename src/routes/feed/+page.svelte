<script lang="ts">
    //import AuthReset from '../../components/AuthReset.svelte';
    import { auth } from "../../lib/firebase/firebase.client";
    import { authHandlers, authStore } from "../../stores/authStore";

    let email: string | null | undefined = "";
    authStore.subscribe((curr) => {
        console.log("CURR", curr);
        email = curr?.currentUser?.email;
    });
</script>

<svelte:head>
    <title>Uninet | Feed</title>
</svelte:head>

{#if $authStore.currentUser}
    <div>
        <h1>CURRENT USER: {email}</h1>
        <!-- <AuthReset /> -->
        <button on:click={authHandlers.logout}>Logout</button>
    </div>
{:else}
    <div>Loading....</div>
{/if}
