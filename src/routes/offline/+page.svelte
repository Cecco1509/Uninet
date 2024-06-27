<script lang="ts">
  import { goto } from "$app/navigation";
  import { ChatCache } from "../../stores/caches/ChatCache.svelte";
  import { MenuStore, Positions } from "../../stores/Menu.svelte";

  MenuStore.getMenu().currentSection = Positions.Login

  ChatCache.removeAllListeners();

    $effect(() => {
        if(!MenuStore.getMenu().offline) {
            goto("/feed");
        }
    })

</script>


<div>
    <h1>Sembri offline</h1>
    <span>L'applicazione non fornisce alcun supporto all'utente offline ☹️</span>
</div>




