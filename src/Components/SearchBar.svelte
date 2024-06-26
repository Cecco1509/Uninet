<script lang="ts">
  import { db } from "$lib/firebase/firebase.client";
  import { collection, getDocs, query, where } from "firebase/firestore";
  import ProfileIcon from "./ProfileIcon.svelte";
  import LoadIcon from "./LoadIcon.svelte";
  import SearchIcon from "./Icons/SearchIcon.svelte";


    let { typing = $bindable(), elements = $bindable(), searchText = $bindable(), collectionName, field,} :// actions, actionsText
     { typing : boolean, elements : any[], searchText : string, collectionName : string, field : string, } = $props() //actions : ((elem : any) => void)[], actionsText : string[]

    let found = false;
    let foundKeyLength = 0;
    let notFound = false;
    let lastCharacter = "";
    let timeout: any = undefined;


    async function getElements() {
        console.log("called");

        found = false;
        notFound = false;
        foundKeyLength = 0;

        const q = query(
        collection(db, collectionName),
        where(field, ">=", searchText),
        where(field, "<=", searchText + "z"),
        );

        const result = await getDocs(q);

        elements = [];
        result.forEach((user) => {
            elements.push(user.data() as UserInfo);
        });
        typing = false;

        console.log(elements);

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
        timeout = setTimeout(getElements, 250);
    };



</script>

<form autocomplete="off">
    <input
        autocomplete="off"
        type="search"
        bind:value={searchText}
        onkeyup={handleChange}
        placeholder="Cerca"
    />
</form>



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
    margin: 10px 0px;
    width: 100%;
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

