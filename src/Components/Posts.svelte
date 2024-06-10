<script lang="ts">
  import PostComponent from "./PostComponent.svelte";
  import viewport from "./useViewportActions";
  import { Feed } from "../stores/Feed.svelte";
  import LoadIcon from "./LoadIcon.svelte";

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
    feed.loadNewPosts();
  }
</script>
{#if feed}
  {#if !feed.isLoading}
    {#if feed.size > 0}
      {#each { length: feed.posts.length - 1 } as _, i}
        <PostComponent post={feed.posts[i]} {inUserPage} {editable} />
        <hr>
      {/each}

      <!-- {#if feed.size >= 10} 
        <div class="posts-spacer"></div>
      {/if} -->
      <div
        use:viewport
        onenterViewport={handleEndPage}
      >
        <PostComponent post={feed.posts[feed.posts.length - 1]} {inUserPage} {editable} />
      </div>
    {:else}
    <div class="nothing">
      <span>Non c'è niente qui</span>
    </div>
      
    {/if}
  {:else}
    Loading
    <LoadIcon/>
  {/if}
{/if}
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
