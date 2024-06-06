import { get, limitToFirst, onValue, ref, set } from "firebase/database";
import { MyUser } from "./userState.svelte";
import { db, realtimeDB } from "$lib/firebase/firebase.client";
import { Chat } from "./Chat.svelte";
import { addDoc, collection, collectionGroup, CollectionReference, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { onIdChange } from "firebase/installations";

export class ChatStore{

    private _chats = $state<chatList>({});
    private unsubscribers : (() => void)[] = []

    private static instance : ChatStore | null = null

    static getChatStote() {
        if(!this.instance) this.instance = new ChatStore();
        return this.instance;
    }

    private constructor(){

        $effect(() => {
            if(MyUser.getUser().isLoading) return;
            
            let unsubscriber = onSnapshot(collection(db, "Users/"+MyUser.getUser().user?.uid+"/chats"), (snapshot) => {
                snapshot.forEach((chatId) => {

                    const unsubscribe = onValue(ref(realtimeDB, "chats/"+chatId.id), (snapshot => {
                        if(snapshot.exists())
                            this._chats[snapshot.key!] = new Chat(snapshot.key!, snapshot.val() as chat);
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

    getChat(id: string){
        if(this._chats[id]) return this._chats[id];

        $effect(() => {

            const unsubscribe = onValue(ref(realtimeDB, "chats/"+id), (snapshot => {
                this._chats[id] = new Chat(id, snapshot.val());
            }));
          
            return () => {
                try {
                    unsubscribe?.();
                } catch (e) {
                    console.log(e);
                }
            };
        })

        return this._chats[id];
    }

    async addChat(searchUser : string) {

        //AGGIUNGERE CONTROLLI DI SICUREZZA

        console.log(MyUser.getUser().userInfo?.Username+"&"+searchUser)

        // Controllo se esiste
        if(this._chats[searchUser+"&"+MyUser.getUser().userInfo?.Username]) return searchUser+"&"+MyUser.getUser().userInfo?.Username;
        if(this._chats[MyUser.getUser().userInfo?.Username+"&"+searchUser]) return MyUser.getUser().userInfo?.Username+"&"+searchUser;

        set(ref(realtimeDB, "chats/" + MyUser.getUser().userInfo?.Username+"&"+searchUser), {
            lastMessage : "",
            timestamp : ""
        })

        setDoc(doc(db, "Users/"+MyUser.getUser().user?.uid+"/chats", MyUser.getUser().userInfo?.Username+"&"+searchUser), {});

        return MyUser.getUser().userInfo?.Username+"&"+searchUser
    }

}