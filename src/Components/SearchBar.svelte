<script lang="ts">
  import { db } from "$lib/firebase/firebase.client";
  import { collection, getDocs, query, where } from "firebase/firestore";

    let { typing = $bindable(), elements = $bindable(), searchText = $bindable(), collectionName, field,} :// actions, actionsText
     { typing : boolean, elements : any[], searchText : string, collectionName : string, field : string, } = $props() //actions : ((elem : any) => void)[], actionsText : string[]

    let found = false;
    let foundKeyLength = 0;
    let notFound = false;
    let lastCharacter = "";
    let timeout: any = undefined;


    async function getElements() {

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
</style>

