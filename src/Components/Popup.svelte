<script lang="ts">

    let {message, success} : {message : string, success : boolean} = $props();
    let popup = $state<HTMLDivElement>()
</script>


<div class={success ? "popup success" : "popup error"} bind:this={popup}>
    <span>{message}</span>
    <button onclick={()=> {popup!.style.animationName = "slide-out"; popup!.style.animationPlayState = "running"} }>x</button>
</div>

<style>
    .popup{
        position: fixed;
        top:-50dvh;
        left: calc(50dvw - 150px);
        width: 300px;
        height: auto;
        padding: 20px;
        box-shadow: 0px 0px 3px grey;
        backdrop-filter: blur(20px);
        --webkit-backdrop-filter: blur(20px);
        animation: slide-in 1s ease-in-out forwards;
    }

    @keyframes slide-in{
        0%{
            top: -50dvh;
        }
        100%{
            top:10px;
        }
    }

    @keyframes slide-out{
        0%{
            top:10px;
        }
        100%{
            top: -50dvh;
           
        }
    }

    .success{
        background-color: rgba(1, 214, 1, 0.201);
        border-radius: 5px;
        border: 1px solid rgb(1, 214, 1);
    }

    .error{
        background-color: rgba(214, 1, 1, 0.201);
        border-radius: 5px;
        border: 1px solid rgb(214, 1, 1);
    }

    button{
        position: absolute;
        right: 10px;
        top: 10px;
        background-color: transparent;
        border: 0px;
        color: white;
    }

    span{
        font-size: 1.3em;
        color: white;
    }
</style>