<div class="ld-cnt">
  <div class="lds-ring">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>


<style>
  .ld-cnt{
    display: grid;
    place-content: center;
  }
  .lds-ring,
  .lds-ring div {
    box-sizing: border-box;
  }
  .lds-ring {
    display: block;
    width: 25px;
    height: 25px;
    border-radius: 50%;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: inherit;
    height: inherit;
    border: 3px solid currentColor;
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
