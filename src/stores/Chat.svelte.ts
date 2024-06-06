import { realtimeDB } from "$lib/firebase/firebase.client";
import { onChildAdded, onValue, ref, set } from "firebase/database";
import { Timestamp } from "firebase/firestore";
import { MyUser } from "./userState.svelte";

export class Chat{
    private _messages = $state<message[]>([]);
    private _chatInfo = $state<chat>();
    private currentUnsubscriber : (() => void) | null;
    private _id = {}
    
    constructor(id: string, chatInfo : chat){
        this._id = id;
        this.currentUnsubscriber = null;
        this._chatInfo = chatInfo;
    }

    get messages(){
        if(this._messages.length > 0) return this._messages;
        
        console.log(this.id)
        $effect(() => {
            this.currentUnsubscriber = onChildAdded(ref(realtimeDB, "messages/" + this._id), (snapshot => {
                if(Number(snapshot.key) == this._messages.length){
                        this._messages.push(snapshot.val() as message);
                        console.log(snapshot.key)
                }
            }));

            return () => this.currentUnsubscriber?.();
        });

        return this._messages;
    }

    get chatInfo(){
        return this._chatInfo;
    }

    get id(){
        return this._id;
    }

    send(text : string){
        set(ref(realtimeDB, "messages/"+this._id+"/"+ this._messages.length),
         {text : text,
          timestamp : Timestamp.fromDate(new Date()),
          sender : MyUser.getUser().userInfo!.Username})
    }
}