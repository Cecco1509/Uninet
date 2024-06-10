import { realtimeDB } from "$lib/firebase/firebase.client";
import { onChildAdded, onValue, ref, set } from "firebase/database";
import { Timestamp } from "firebase/firestore";
import { MyUser } from "./userState.svelte";
import { ChatStore } from "./ChatList.svelte";
import { format } from "prettier";

export class Chat{
    private _messages = $state<message[]>([]);
    private _chatInfo = $state<chatInfo>();
    private currentUnsubscriber : (() => void) | null;
    private _to : string;
    private _id = $state<string>();
    
    constructor(id: string, to : string, chatInfo : chatInfo){
        this._id = id;
        this.currentUnsubscriber = null;
        this._chatInfo = chatInfo;
        
        this._to = to;
    }

    get messages(){
        if(this.currentUnsubscriber) return this._messages;
        
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

    setId(arg0: string) {
        this._id = arg0;
    }

    get chatInfo(){
        return this._chatInfo;
    }

    get id(){
        return this._id;
    }

    get to(){
        return this._to;
    }

    send(text : string){
        const date = new Date();

        const strDate = date.getHours().toString().padStart(2, '0')+":"+date.getMinutes().toString().padStart(2, '0')+" "+date.getDay().toString().padStart(2, '0')+"/"+date.getMonth().toString().padStart(2, '0')+"/"+date.getFullYear();

        ChatStore.getChatStore().setLastMessage(this.to, {lastMessage : text, timestamp : strDate}, this._id == "" ? this : null);

        this._chatInfo = {lastMessage : text, timestamp : strDate};

        set(ref(realtimeDB, "messages/"+this._id+"/"+ this._messages.length),
         {text : text,
          timestamp : strDate,
          sender : MyUser.getUser().userInfo!.Username})
    }
}