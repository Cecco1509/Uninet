<script lang="ts">
  import User from "../../../Components/User.svelte";
  export let data: { id: string };
</script>

<svelte:head>
  <title>Uninet | User</title>
</svelte:head>

<User userId={data.id} />
