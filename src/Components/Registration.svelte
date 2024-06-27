<script lang="ts">
  import { db, storage } from "$lib/firebase/firebase.client";
  import { Timestamp, doc, setDoc } from "firebase/firestore";
  import ProfileIcon from "./ProfileIcon.svelte";
  import CanceIcon from "./Icons/CanceIcon.svelte";
  import { ref, uploadBytes } from "firebase/storage";
  import { uuidv4 } from "@firebase/util";
  import { goto } from "$app/navigation";

  let { userID } : {userID: string} = $props();

  let username = $state("");
  let nome = $state("");
  let cognome = $state("");
  let data = $state("");
  let input = $state<HTMLInputElement>();
  let profileImage = $state("");
  let step = $state(1);
  let bio = $state("");
  let avatar = $state<FileList>();
  let area = $state<number>(-1);
  let course=$state("");
  let allowNotify = $state(false);
  let rememberMe = $state(true)
  const tester = new RegExp(/^[a-zA-Z0-9]+$/);

  const courses = [
    //Scienze matematiche, fisiche e della natura
    [
      "Biotecnologie",
      "Chimica",
      "Chimica per l'industria e l'ambiente",
      "Fisica",
      "Geology",
      "Informatica",
      "Informatica umanistica",
      "Matematica",
      "Scienze biologiche",
      "Scienze geologiche",
      "Scienze marittime e navali",
      "Scienze naturali ed ambientali",
    ],
    //Scienze giuridiche, economiche e sociali
    [
      "Banca, finanza e mercati finanziari",
    "Diritto dell'impresa, del lavoro e delle pubbliche amministrazioni",
    "Economia aziendale",
    "Economia e commercio",
    "Economia e legislazione dei sistemi logistici",
    "Giurisprudenza (Accademia Navale)",
    "Giurisprudenza",
    "Management for business and economics",
    "Scienze del servizio sociale",
    "Scienze del turismo",
    "Scienze marittime e navali",
    "Scienze politiche",
  ],

    //Medicina e Farmacia
  [
    "Chimica e tecnologia farmaceutiche",
    "Dietistica",
    "Farmacia",
    "Fisioterapia",
    "Igiene dentale", 
    "Infermieristica", 
    "Logopedia",
    "Medicina e chirurgia",
    "Odontoiatria e protesi dentaria",
    "Ostetricia",
    "Podologia",
    "Scienze dei prodotti erboristici e della salute",
    "Scienze e tecniche di psicologia clinica e sperimentale",
    "Scienze motorie",
    "Tecnica della riabilitazione psichiatrica",
    "Tecniche audioprotesiche",
    "Tecniche della prevenzione nell'ambiente e nei luoghi di lavoro",
    " Tecniche di laboratorio biomedico ",
    "Tecniche di radiologia medica",
    "Terapia della neuro e psicomotricità dell'età evolutiva",
  ],
  //Ingegneria
  [
    "Ingegneria aerospaziale",
    "Ingegneria biomedica",
    "Ingegneria chimica",
    "Ingegneria civile ambientale e edile",
    "Ingegneria dell'energia",
    "Ingegneria delle telecomunicazioni",
    "Ingegneria edile-architettura",
    "Ingegneria elettronica",
    "Ingegneria gestionale",
    "Ingegneria informatica",
    "Ingegneria meccanica",
    "Ingegneria per il design industriale",
    "Scienze marittime e navali",
    "Tecniche per la meccanica e la produzione",
    "Tecniche per le costruzioni civili e la gestione del territorio",
  ],
  //Discipline umanistiche
  [
    "Discipline dello spettacolo e della comunicazione",
    "Filosofia",
    "Informatica umanistica",
    "Lettere",
    "Lingua e cultura italiana per stranieri",
    "Lingue e letterature straniere",
    "Scienze dei beni culturali",
    "Scienze del turismo",
    "Scienze della formazione primaria",
    "Scienze per la pace: cooperazione internazionale e trasformazione dei conflitti",
    "Storia",
  ],
    // Agraria e Veterinaria
  ["Medicina veterinaria",
      "Scienze agrarie",
      "Scienze dei prodotti erboristici e della salute",
      "Scienze e tecnologie delle produzioni animali",
      "Tecniche di allevamento animale ed educazione cinofila",
      "Viticoltura ed enologia"],
  ]
  
  
  let step2Validity = $derived(username.length >= 3 && tester.test(username));
  let step3Validity = $derived(nome && tester.test(nome) && cognome && tester.test(cognome) && data)

  //const allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  const handleInput = ()=>{

    if(!input || !avatar || avatar.length != 1) return;

    const file = avatar![0];

    const reader = new FileReader();
    reader.addEventListener("load", function () {
      profileImage = reader.result as string;
    });
    reader.readAsDataURL(file);

  }

  const deleteSelection = () => {
    input!.value = "";
    profileImage= "";
  }

  async function uploadCurrentPhoto(): Promise<string> {
    if(!avatar || avatar.length != 1) return "";

    let url = "postImages/" + uuidv4() + "." + avatar[0].type.split("/")[1];

    try {
      const imageRef = ref(storage, url);
      await uploadBytes(imageRef, avatar[0]);
    } catch (e) {
      url = "";
    }

    return url;
  }

  const handleSubmit = async (e: Event) => {

    if(username.length < 3) {
      step = 2;
      return;
    }

    if(!nome || !cognome || !data) return;

    

    try {
      await setDoc(doc(db, "Users", userID), {
        Nome: nome,
        Cognome: cognome,
        birthday: Timestamp.fromDate(new Date(data)),
        img: await uploadCurrentPhoto(),
        Bio: "",
        seguiti: 0,
        Followers: 0,
        Username: username,
        private: false,
        posts: 0,
        course: course,
        notify : allowNotify,
        rememberMe : true,
      });
      goto("/users/" + username);
    } catch (e) {
      console.log(e);
    }
  };

</script>

<div class="cnt">

  <!-- <span class="reg-text"> Completa la registrazione!</span> -->
  <div class="section">

    {#if step == 1}
    <div class="center">
      <label for="profileImg"> Seleziona un'immagine profilo </label>
      <div class="profile-img">
      <ProfileIcon img={profileImage} inRegistration={true} dimension={"big"} groupIcon={false}/>
      </div>
    
      <div class="file-inp">
        <input type="file" bind:this={input} bind:files={avatar} name="profilePic" id="profileImg" accept="image/*" onchange={handleInput}>
        {#if profileImage}
          <button class="deselect" onclick={deleteSelection}>
            <CanceIcon />
          </button>
        {/if}
      </div>
    </div>
    
    {:else if step == 2}

      <label for="username">username</label><br>
      <input bind:value={username} type="text" name="username" id="username" placeholder="minimo 3 caratteri alfanumerici">

      <br>
      <label for="bio">bio</label><br>
      <textarea spellcheck="false" bind:value={bio} name="bio" id="bio" placeholder="Breve descrizione personale" maxlength="255"></textarea>
      
    {:else if step == 3}

    <label for="nome">Nome</label><br>
    <input bind:value={nome} type="text" name="nome" id="nome" placeholder="Mario">


    <label for="cognome">Cognome</label><br>
    <input bind:value={cognome} type="text" name="cognome" id="cognome" placeholder="Rossi">

    <label for="data">data di nascita</label><br>
    <input bind:value={data} type="date" name="data" id="data" placeholder="2005-01-01" max="2005-12-31">

    {:else if step == 4}

      <div style="margin: 5% 10px;">
        <input type="checkbox" name="notify" id="notify" bind:checked={allowNotify}>
        <label for="notify">
          {#if allowNotify}
            Assicurati di aver attivato le notifiche del browser
          {:else}
            Consenti a Uninet di inviarti delle notifiche
          {/if}
        </label>
      </div>

      <label for="area">Scegli l'area del tuo corso
      </label>
      <select name="area" id="uni" bind:value={area}>
        <option value={-1} selected></option>
        <option value={0}>Scienze matematiche, fisiche e della natura</option>
        <option value={1}>Scienze giuridiche, economiche e saociali</option>
        <option value={2}>Medicina e Farmacia</option>
        <option value={3}>Ingegneria</option>
        <option value={4}>Discipline umanistiche</option>
        <option value={5}>Agraria e Veterinaria</option>
      </select>

      {#if area != -1}
        <label for="area">Scegli il tuo corso di laurea</label>
        <select name="area" id="uni" bind:value={course}>
          {#each courses[area] as course}
              <option value={course}>{course}</option>
          {/each}
        </select>
      {/if}
    {/if}
    
  </div>

  <div class="sliders">
    <button disabled={step == 1} onclick={() => step--}>precedente</button>
    <button class="non-clickable">{step}/4</button>
    {#if step == 3}
      <button disabled={!step3Validity} onclick={() => {step++}}>successivo</button>
    {:else if step == 2}
      <button onclick={() => {step++}} disabled={(step == 2 && !step2Validity)}  >successivo</button>
    {:else if step == 4}
      <button class="complete" disabled={area == -1 || !course} onclick={handleSubmit}>completa</button>
    {:else}
      <button onclick={() => {step++}}>successivo</button>
    {/if}
  </div>

</div>


<style>

  select{
    overflow: scroll;
    outline: none;
    width: 100%;
    margin: 5px 0px;
    height: 5vh;
    box-sizing: border-box !important;
    border-radius: 10px;
    background-color: #393e41;
    color: white;
    border: 2px solid #28736f;
    padding: 0px 10px;
    /*font-size: 16px;       */
    transition: all 0.5s;
    margin-bottom: 10%;
    animation: fadeIn 0.7s forwards;

    &:focus {
      border-color: #21e3da;
      box-shadow: 0px 0px 6px #21e3da;
    }
  }

  .center{
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  textarea {
    outline: none;
    width: 100%;
    margin: 5px 0px;
    height: 30%;
    box-sizing: border-box !important;
    border-radius: 10px;
    background-color: #393e41;
    color: white;
    border: 2px solid #28736f;
    padding: 10px;
    /*font-size: 16px;       */
    resize: vertical;
    max-height: 60%;
    animation: fadeIn 0.7s forwards;
    min-height: auto;

    &:last-child {
      margin-bottom: 10px;
    }

    &:focus {
      border-color: #21e3da;
      box-shadow: 0px 0px 6px #21e3da;
    }
  }


  input[type = text], input[type=date]{
    outline: none;
    width: 100%;
    margin: 5px 0px;
    height: 5vh;
    box-sizing: border-box !important;
    border-radius: 10px;
    background-color: #393e41;
    color: white;
    border: 2px solid #28736f;
    padding: 0px 10px;
    /*font-size: 16px;       */
    transition: all 0.5s;
    margin-bottom: 10%;
    animation: fadeIn 0.7s forwards;

    &:focus {
      border-color: #21e3da;
      box-shadow: 0px 0px 6px #21e3da;
    }
  }

  .complete{
    border: 2px solid #21e3da;
    color: #21e3da;
    background-color: rgba(33, 227, 218, 0.1);

    &:hover{
      background-color: #20e1d0;
      color: #393e41;
      box-shadow: 0px 0px 6px #21e3da;
    }
  }

  button {
    border-radius: 10px;
    cursor: pointer;
    border: 2px solid #e6c96091;
    margin: 5px 0px;
    width: 30%;
    background-color: #e6c9601f;
    /*font-size: 20px;       */
    color: #e6c960;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled{
      opacity: 0.4;
      pointer-events: none;
    }
  }

  .non-clickable{
    width: 20%;
    background-color: transparent;
    border: none;
    color: #393e41;
    font-size: 1.3em;
    pointer-events: none;
  }

  button:hover {
    background-color: #e6c960;
    color: #393e41;
    box-shadow: 0px 0px 6px #e6c960;
  }

  .section{
    width: 100%;
    height: 70%;
    padding-top: 5%;
    label{
      padding-left: 10px;
    }
  }

  .sliders{
    height: 10%;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .file-inp{
    display: flex;
    align-items: center;
  }

  .deselect{
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    margin-left: 10px;
    align-items: center;
    background-color: transparent;
    border: none;

    &:hover{
      background-color: transparent;
      box-shadow: none;
    }
  }

  @keyframes fadeIn{
    0%{
      opacity: 0;
    }

    100%{
      opacity: 1;
    }
  }

  label{
    padding-top: 20px;
    font-size: 1.1em;
    color: #5c5c5c;
  }

  input[type=file] {
    margin: 10px 0px;
    max-width: 100%;
    color: #444;
    padding: 5px;
    background: #ffffff00;
    border-radius: 10px;
    border: 1px solid #555;
  }

  input[type=file]::file-selector-button {
    margin-right: 20px;
    border: none;
    background: #21e3d99e;
    padding: 10px 20px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: background .2s ease-in-out;
  }

  input[type=file]::file-selector-button:hover {
    background: #21e3d942;
  }

  .cnt{
    width: 100%;
    height: 100%;
    display: block;
  }

  .profile-img{
    padding-top: 10px;
  }

  input[type = checkbox]{
    width: 1.3em;
    height: 1.3em;
    outline: none;
    box-sizing: border-box !important;
    background-color: #393e41;
    color: white;
    border: 2px solid #28736f;
    padding: 0px 10px;
    /*font-size: 16px;       */
    transition: all 0.5s;
    margin-bottom: 10%;
    animation: fadeIn 0.7s forwards;

    &:focus {
      border-color: #21e3da;
    }
  }
</style>