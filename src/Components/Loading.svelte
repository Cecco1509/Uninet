<script>
  import LoadIcon from "./LoadIcon.svelte";
</script>

<div class="loading-wrapper">
  <!-- <LoadIcon /> -->
  <div class="lds-ring">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>

<style>
  .loading-wrapper {
    position: fixed;
    overflow: none;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 3;
    left: 0px;
    top: 0px;
    height: 100dvh;
    width: 100dvw;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .lds-ring,
  .lds-ring div {
    box-sizing: border-box;
  }
  .lds-ring {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle, transparent 57%, grey 43%);
  }
  .lds-ring div {
    z-index: 1;
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 80px;
    height: 80px;
    /* margin: 8px; */
    border: 8px solid currentColor;
    border-radius: 50%;
    animation: lds-ring 1.2s linear infinite;
    border-color: currentColor transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
