<script lang="ts">
    import PostComponent from "./PostComponent.svelte";
    import viewport from "./useViewportActions";
    import LoadIcon from "./LoadIcon.svelte";
  import VolantinoComponent from "./VolantinoComponent.svelte";
  import type { VolantiniFeed } from "../stores/Feeds/VolantiniFeed.svelte";
  
    let {
      feed,
      editable,
      inUserPage
    } : {
      feed: VolantiniFeed;
      editable: boolean;
      inUserPage: boolean;
    } = $props();

    const handleEndPage = () => {
      console.log("Load")
      feed.loadMore()
    }
  </script>
  {#await feed.getElements()}
    <LoadIcon />
  {:then volantini}
      {#if volantini.length > 0}
        {#each { length: volantini.length - 1 } as _, i}
          <VolantinoComponent volantino={volantini[i]} {inUserPage} {editable} />
        {/each}

        <!-- {#if feed.size >= 10} 
          <div class="posts-spacer"></div>
        {/if} -->
        <div
          use:viewport
          onenterViewport={handleEndPage}
        >
          <VolantinoComponent volantino={volantini[volantini.length - 1]} {inUserPage} {editable} />
        </div>
      {:else}
      <div class="nothing">
        <span>Non c'è niente qui</span>
      </div>
        
      {/if}
  {/await}
    
  <style>
  
    .nothing{
      height: 30vh;
      background-color: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    span{
      font-size: large;
    }
  
    @keyframes slideIn {
      0% {
        height: 100vh;
      }
      100% {
        height: 0px;
      }
    }
  </style>
  