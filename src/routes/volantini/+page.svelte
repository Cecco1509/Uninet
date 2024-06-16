<script lang="ts">

</script>

<div class="top-bar-cnt">
    <div class="top-bar">
        <span>CIAO</span>
        <span>Volantini</span>
        <span>CIAO</span>
        
    </div>
</div>

<div class="cnt">
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
    <div class="volantino"></div>
</div>


<style>
 .cnt{
        width: auto;
        height: 100dvh;
        background-color: black;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: space-between;

        &:before,
        &:after {
        content: "";
        flex-basis: 100%;
        width: 0;
        order: 2;
        }
        
    }

    .top-bar-cnt{
        height: 60px;
        width: calc(100% - 80px);
        position: fixed;
        display: grid;
        place-items: center;
        top : 20px;
        left: 60px;
        
        animation: fadeIn 0.5s forwards;
        

        .top-bar{
            
            width: 80%;
            height: 100%;
            border-radius: 25px;
            background-color: rgba(252, 252, 252, 0.138);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 1;
        }

    }

    .volantino{
        width: 32%;
        height: 100px;
        margin-bottom: 2%;
        background-color: rgba(127, 255, 212, 0.392);
        margin: 10px;

        &:nth-child(3n+1) { order: 1; }
        &:nth-child(3n+2) { order: 2; }
        &:nth-child(3n)   { order: 3; }
    }

    .container {
        
        /* Your container needs a fixed height, and it 
        * needs to be taller than your tallest column. */
        height: 600px; 
        }

        .item {
        width: 32%;
        margin-bottom: 2%; /* Optional */
        }

        /* Re-order items into 3 rows */
        .item:nth-child(3n+1) { order: 1; }
        .item:nth-child(3n+2) { order: 2; }
        .item:nth-child(3n)   { order: 3; }

        /* Force new columns */
        


    @keyframes fadeIn{
    0%{
      opacity: 0;
    }

    100%{
      opacity: 1;
    }
  }

</style>