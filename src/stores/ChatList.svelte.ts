import { get, limitToFirst, onValue, ref, set, update } from "firebase/database";
import { MyUser } from "./userState.svelte";
import { db, realtimeDB } from "$lib/firebase/firebase.client";
import { Chat } from "./Chat.svelte";
import { addDoc, collection, collectionGroup, CollectionReference, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { onIdChange } from "firebase/installations";
import { DataBasaConn } from "./db.svelte";

export class ChatStore{

    private _chats = $state<chatList>({});
    private unsubscribers : (() => void)[] = []

    private static instance : ChatStore | null = null

    static getChatStore() {
        if(!this.instance) this.instance = new ChatStore();
        return this.instance;
    }

    private constructor(){

        $effect(() => {

            console.log("HEUUU");

            if(MyUser.getUser().isLoading) return;

            console.log("HEUUU1");
            
            let unsubscriber = onSnapshot(collection(db, "Users/"+MyUser.getUser().user?.uid+"/chats"), (snapshot) => {
                snapshot.forEach((chatId) => {

                    const unsubscribe = onValue(ref(realtimeDB, "chats/"+chatId.id), (snapshot => {
                        if(snapshot.exists()){
                            const partecipants = snapshot.key!.split("&");
                            if(MyUser.getUser().userInfo!.Username == partecipants[0]) {
                                this._chats[partecipants[1]] = new Chat(snapshot.key!, partecipants[1], snapshot.val() as chatInfo);
                                console.log(partecipants[1])
                            } else{
                                this._chats[partecipants[0]] = new Chat(snapshot.key!, partecipants[0], snapshot.val() as chatInfo);
                                console.log(partecipants[0])
                            }
                        }
                    }));
                
                    this.unsubscribers.push(unsubscribe)
                   
                })
               
            });

            return () => {
                unsubscriber?.();
                this.unsubscribers.forEach(unsub => {
                    unsub?.();
                })
            }
        });
    }

    get chats(){
        return this._chats;
    }

    getChat(username: string){

        // const unsubscribe = onValue(ref(realtimeDB, "chats/"+id), (snapshot => {
        //     if(snapshot.exists())
        //         this._chats[id] = new Chat(id, snapshot.val());
        //     else this._chats[id] = undefined;
        // }));

        return this._chats[username];
    }

    async addChat(id : string, username : string){
        await setDoc(doc(db,"Users/"+MyUser.getUser().user?.uid+"/chats", id), {});
        const userInfo = await DataBasaConn.getDB().getUserInfo(username);
        await setDoc(doc(db,"Users/"+userInfo?.id+"/chats", id), {})
    }

    async setLastMessage(username : string, newInfo : chatInfo, newChat : Chat | null = null){

        if(!this._chats[username] && newChat){
            this._chats[username] = newChat;
            newChat.setId(MyUser.getUser().userInfo!.Username+"&"+username);
            await this.addChat(newChat.id!, username);
        }

        console.log(this._chats[username]?.id)
        await set(ref(realtimeDB, "chats/" + this._chats[username]?.id), newInfo);

    }

    // async addChat(searchUser : string, initInfo : chatInfo) {

    //     //AGGIUNGERE CONTROLLI DI SICUREZZA

    //     console.log(MyUser.getUser().userInfo?.Username+"&"+searchUser)

    //     // Controllo se esiste
    //     if(this._chats[searchUser+"&"+MyUser.getUser().userInfo?.Username]) return searchUser+"&"+MyUser.getUser().userInfo?.Username;
    //     if(this._chats[MyUser.getUser().userInfo?.Username+"&"+searchUser]) return MyUser.getUser().userInfo?.Username+"&"+searchUser;

    //     set(ref(realtimeDB, "chats/" + MyUser.getUser().userInfo?.Username+"&"+searchUser), initInfo)

    //     setDoc(doc(db, "Users/"+MyUser.getUser().user?.uid+"/chats", MyUser.getUser().userInfo?.Username+"&"+searchUser), {});

    //     return MyUser.getUser().userInfo?.Username+"&"+searchUser
    // }

}