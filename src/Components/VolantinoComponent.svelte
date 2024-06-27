<script lang="ts">
  import { goto } from "$app/navigation";
  import type { Volantino } from "../stores/FeedElements/Volantino.svelte";
  import { MenuStore, Positions } from "../stores/Menu.svelte";

  let {
    volantino,
    inUserPage,
    editable,
  }: {
    volantino: Volantino;
    inUserPage: boolean;
    editable: boolean;
  } = $props();
</script>

<div class="volantino">
  <div class="info">
    <span class="titolo">{volantino.data.text}</span>

    <button
      onclick={() => {
        MenuStore.getMenu().currentSection = Positions.Messages;
        goto("/messages#" + volantino.data.createdBy);
      }}>Contatta</button
    >
  </div>
  <img src={MenuStore.getMenu().offline ? "" : volantino.data.img} alt="" />
</div>

<style>
  .volantino {
    height: 700px;
    width: 500px;
    margin: 11.25px;
    border-radius: 10px;
    animation: fade-in ease-in-out 1s;
    animation-fill-mode: forwards;

    img {
      width: 100%;
      height: 100%;
      background-color: grey;
    }

    .info {
      position: absolute;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 100px;
      margin-top: 400px;
    }

    .titolo {
      color: white;
      margin: 10px;
      z-index: 2;
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }
</style>
