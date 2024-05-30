<script lang="ts">
  import PostComponent from "./PostComponent.svelte";
  import viewport from "./useViewportActions";
  import { Feed } from "../stores/Feed.svelte";

  let {
    feed,
    editable,
    inUserPage
  } : {
    feed: Feed;
    editable: boolean;
    inUserPage: boolean;
  } = $props();

  let fetchedAll = false;

  const handleEndPage = () => {
    if (fetchedAll) return;
    feed.loadNewPosts().then((f) =>{
      fetchedAll = f;
    });
  }
</script>

<div class="posts-spacer"></div>
{#if feed.posts}
  {#each { length: feed.posts.length - 2 } as _, i}
    <PostComponent post={feed.posts[i]} {inUserPage} {editable} />
  {/each}

  <div
    use:viewport
    onenterViewport={handleEndPage}
  >
    <PostComponent post={feed.posts[feed.posts.length - 1]} {inUserPage} {editable} />
  </div>
{/if}

<style>
  .posts-spacer {
    animation: slideIn ease-in-out 1.5s;
    animation-fill-mode: forwards;
    height: 50vh;
  }
  @keyframes slideIn {
    0% {
      height: 50vh;
    }
    100% {
      height: 0px;
    }
  }
</style>
