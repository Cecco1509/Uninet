<script lang="ts">
  import { logEvent } from "firebase/analytics";
  import User from "../../Components/User.svelte";
  import {
    collection,
    endAt,
    getDoc,
    getDocs,
    orderBy,
    query,
    startAt,
    where,
  } from "firebase/firestore";
  import { db } from "$lib/firebase/firebase.client";
  import ProfileIcon from "../../Components/ProfileIcon.svelte";
  import { goto } from "$app/navigation";
  import LoadIcon from "../../Components/LoadIcon.svelte";
  import SearchIcon from "../../Components/Icons/SearchIcon.svelte";
  import { MenuStore, Positions } from "../../stores/Menu.svelte";

  let searchText = $state<string>("");
  let users = $state<UserInfo[]>([]);
  let found = false;
  let foundKeyLength = 0;
  let notFound = false;
  let lastCharacter = "";
  let typing = $state(false);
  let timeout: any = undefined;

  MenuStore.getMenu().currentSection = Positions.Search;

  async function getUsers() {
    console.log("called");

    found = false;
    notFound = false;
    foundKeyLength = 0;

    const q = query(
      collection(db, "Users"),
      where("Username", ">=", searchText),
      where("Username", "<=", searchText + "z"),
    );

    const result = await getDocs(q);

    users = [];
    result.forEach((user) => {
      users.push(user.data() as UserInfo);
    });
    typing = false;

    console.log(users);

    if (result.size == 1) {
      found = true;
      foundKeyLength = searchText.length;
      return;
    }

    if (result.size == 0) {
      notFound = true;
      foundKeyLength = searchText.length;
      lastCharacter = searchText.charAt(foundKeyLength - 1);
    }
  }

  const handleChange = async () => {
    if (searchText.length < 3) {
      found = false;
      notFound = false;
      foundKeyLength = 0;
      return;
    }
    if (
      (found && searchText.length >= foundKeyLength) ||
      (notFound && searchText.length >= foundKeyLength)
    ) {
      if (
        !(
          searchText.length == foundKeyLength &&
          lastCharacter != searchText.charAt(searchText.length - 1)
        )
      ) {
        typing = false;
        return;
      }
    }

    typing = true;

    if (timeout != undefined) clearTimeout(timeout);
    timeout = setTimeout(getUsers, 250);
  };
</script>

<form autocomplete="off">
  <input
    autocomplete="off"
    type="search"
    bind:value={searchText}
    onkeyup={handleChange}
    placeholder="Cerca per username"
  />
</form>

<br /><br />
{#if !typing}
  {#if users.length == 0}
    <div class="empty-list">
      {#if searchText.length != 0}
        <span>utente non trovato</span>
      {:else}
        <span>Cerca un collega su Uninet</span>
        <div class="icon"><SearchIcon /></div>
      {/if}
    </div>
  {:else}
    <span class="result">Risultati : </span>
    <br /><br />
    {#each users as user}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="usr-cnt">
        <div class="info">
          <ProfileIcon img={user!.img} inFeed={true} />
          <div>
            <span>
              {user?.Username}
            </span>
            <span class="flws">
              • {user?.Followers} Followers
            </span>
          </div>
        </div>
        <div>
          <button onclick={() => goto("/users/" + user?.Username)}
            >Visualizza</button
          >
          <button
            onclick={() => {
              goto("/messages#" + user?.Username);
              MenuStore.getMenu(null).currentSection = Positions.Messages;
            }}>Scrivi</button
          >
        </div>
      </div>
    {/each}
  {/if}
{:else}
  <LoadIcon />
{/if}

<style>
  .icon {
    fill: white;
  }

  .result {
    padding-left: 15px;
    font-size: 1.5em;
  }

  input {
    padding: 20px;
    margin: 10px;
    width: calc(100% - 20px);
    background-color: #e6c96021;
    border: 1px solid #e6c960;
    border-radius: 5px;
    color: white;
    font-size: 1.5em;
    outline: none;
    transition: all 0.3s;

    &:focus {
      box-shadow: 0px 0px 7px #e6c960;
    }
  }

  .info {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  span {
    padding-left: 10px;
    font-size: 1.3em;
    vertical-align: middle;
  }

  .empty-list {
    height: 100px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button {
    cursor: pointer;
    margin-left: 10px;
    border: none;
    border-radius: 5px;
    background-color: transparent;
    color: white;
    width: auto;
    padding: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: #e6c9605c;
    }
  }

  .usr-cnt {
    margin: 10px;
    border: 1px solid gray;
    border-radius: 5px;
    padding: 10px 20px;
    width: calc(100% - 20px);
    background-color: rgba(255, 255, 255, 0.086);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s;

    &:hover {
      border-color: #e6c9606a;
    }
  }

  .flws {
    color: rgba(255, 255, 255, 0.744);
    padding: 0px;
    font-size: 1em;
  }
</style>
