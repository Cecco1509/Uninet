<script lang="ts">
  import PostComponent from "./PostComponent.svelte";
  import viewport from "./useViewportActions";
  import LoadIcon from "./LoadIcon.svelte";
  import type { Feed } from "../stores/Feeds/Feed.svelte";
  import { Post } from "../stores/FeedElements/Post.svelte";

  let {
    feed,
    editable,
    inUserPage
  } : {
    feed: Feed;
    editable: boolean;
    inUserPage: boolean;
  } = $props();

  $inspect(feed);

  const handleEndPage = () => {
    console.log("Tried fetching", feed.fetchedAll)
    feed.loadMore();
  }
</script>

  {#await feed.getElements()}
    <LoadIcon />
  {:then elements} 
    {#if elements.length > 0}
      {#each { length: elements.length - 1 } as _, i}
        <PostComponent post={elements[i] as Post} {inUserPage} {editable} />
        <hr>
      {/each}

      <!-- {#if feed.size >= 10} 
        <div class="posts-spacer"></div>
      {/if} -->
      <div
        use:viewport
        onenterViewport={handleEndPage}
      >
        <PostComponent post={elements[elements.length - 1] as Post} {inUserPage} {editable} />
      </div>
    {:else}
      <div class="nothing">
        <span>Non c'è niente qui</span>
      </div>
      
    {/if}
  {/await}
<style>

  hr{
    height: 1px;
    border: none;
    background-color: rgba(255, 255, 255, 0.201);
  }

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
