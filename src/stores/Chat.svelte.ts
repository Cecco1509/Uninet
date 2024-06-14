import { realtimeDB } from "$lib/firebase/firebase.client";
import {
  endAt,
  endBefore,
  get,
  limitToFirst,
  limitToLast,
  onChildAdded,
  onValue,
  orderByKey,
  orderByValue,
  query,
  ref,
  set,
  startAfter,
  startAt,
  type Query,
} from "firebase/database";
import { Timestamp } from "firebase/firestore";
import { MyUser } from "./userState.svelte";
import { ChatStore } from "./ChatList.svelte";
import { format } from "prettier";

export class Chat {
  private _messages = $state<message[]>([]);
  private _newMessages = $state<message[]>([])
  private _chatInfo = $state<chatInfo>();
  private currentUnsubscriber: (() => void) | null;
  private _to: string;
  private _id = $state<string>();
  private _fetchedAll = $state(false);

  private static pageSize: number = 30;

  constructor(id: string, to: string, chatInfo: chatInfo) {
    this._id = id;
    this.currentUnsubscriber = null;
    this._chatInfo = chatInfo;

    this._to = to;
  }

  async getMessages(): Promise<message[]> {

    if (this._messages.length > 0) return this._messages;

    const q = query(
      ref(realtimeDB, "messages/" + this._id),
      orderByKey(),
      limitToLast(Chat.pageSize),
    );

    const result = await get(q);

    result.forEach((snapshot) => {
      this._messages.push({
        ...(snapshot.val() as message),
        id: snapshot.key!,
      });
    });

    this._fetchedAll = this._messages.length < Chat.pageSize;

    if(this._messages.length > 0)
      this.currentUnsubscriber = this.getUnsubscriber();

    return this._messages;
  }

  private getUnsubscriber() : (() => void){
    let q1 :  Query | null = null;

    if(this._messages.length > 0){
      q1 = query(
        ref(realtimeDB, "messages/" + this._id),
        orderByKey(),
        startAfter(this._messages[this._messages.length - 1].id),
      );
    }

    return onChildAdded(q1 ? q1 : ref(realtimeDB, "messages/" + this._id), (snapshot) => {
      this._messages.push({
        ...(snapshot.val() as message),
        id: snapshot.key!,
      });
    });
  }

  get newMessages(){
    return this._newMessages;
  }

  setId(arg0: string) {
    this._id = arg0;
  }

  get chatInfo() {
    return this._chatInfo!;
  }

  set chatInfo(info: chatInfo) {
    this._chatInfo = info;
  }

  get id() {
    return this._id;
  }

  get to() {
    return this._to;
  }

  get fetchedAll(){
    return this._fetchedAll;
  }

  async loadMoreMessages() {
    if (this._fetchedAll) return;

    const start = Number(this._newMessages.length > 0 ? this._newMessages[0].id : this._messages[0].id) - Chat.pageSize;
    const end : string = this._newMessages.length > 0 ? this._newMessages[0].id : this._messages[0].id
    
    console.log("startAt", start, "endBefore", end);

    const q = query(
      ref(realtimeDB, "messages/" + this._id),
      orderByKey(),
      startAt(start > 0 ? ""+start : "0"),
      endBefore(end),
    );

    const result = await get(q);
    let newMessages : message[] = []

    result.forEach((message) => {
      newMessages.push({...message.val(), id: message.key})
      console.log(message.key)
    });

    if(this._newMessages.length == 0) this._newMessages = newMessages;
    else {
      this._messages = [...this._newMessages, ...this._messages];
      this._newMessages = newMessages;
    }
    

    this._fetchedAll = newMessages[0].id == "0";
  }

  async send(text: string) {

    const date = new Date();

    const strDate =
      date.getHours().toString().padStart(2, "0") +
      ":" +
      date.getMinutes().toString().padStart(2, "0") +
      " " +
      date.getDate().toString().padStart(2, "0") +
      "/" +
      date.getMonth().toString().padStart(2, "0") +
      "/" +
      date.getFullYear();

    await ChatStore.getChatStore().setLastMessage(
      this.to,
      { lastMessage: text, timestamp: strDate },
      this._id == "" ? this : null,
    );

    //this._chatInfo = { lastMessage: text, timestamp: strDate };

    let id = 0;
    if(this._newMessages.length == 0 && this._messages.length > 0) id = Number(this._messages[this._messages.length-1].id) + 1;
    else if(this._newMessages.length > 0) id = Number(this._messages[this._messages.length-1].id) + 1;

    await set(
      ref(
        realtimeDB,
        "messages/" +
          this._id +
          "/" +
          id,
      ),
      {
        text: text,
        timestamp: strDate,
        sender: MyUser.getUser().userInfo!.Username,
      },
    );

    if(this._messages.length == 0)
      this.currentUnsubscriber = this.getUnsubscriber()

  }
}
