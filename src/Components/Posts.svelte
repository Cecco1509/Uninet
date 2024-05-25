<script lang="ts">
  import Post from "./Post.svelte";
  import viewport from "./useViewportActions";

  let {
    posts,
    editable,
    inUserPage,
    atEnd = $bindable(),
  } : {
    posts: PostSchema[];
    editable: boolean;
    inUserPage: boolean;
    atEnd: boolean;
  }= $props();

  const handleEndPage = function () {
    atEnd = true;
  };
</script>

<div class="posts-spacer"></div>
{#if posts}
  {#each { length: posts.length - 1 } as _, i}
    <Post post={posts[i]} inUserPage {editable} />
  {/each}

  <div
    use:viewport
    onenterViewport={handleEndPage}
    onexitViewport={() => console.log("exit!")}
  >
    <Post post={posts[posts.length - 1]} inUserPage {editable} />
  </div>
{/if}

<style>
  .posts-spacer {
    animation: fadeInAnimation ease-in-out 1.5s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    height: 50vh;
  }
  @keyframes fadeInAnimation {
    0% {
      height: 50vh;
    }
    100% {
      height: 0px;
    }
  }
</style>
