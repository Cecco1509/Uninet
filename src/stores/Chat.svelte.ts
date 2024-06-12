import { realtimeDB } from "$lib/firebase/firebase.client";
import {
  get,
  limitToLast,
  onChildAdded,
  onValue,
  orderByKey,
  orderByValue,
  query,
  ref,
  set,
  startAfter,
} from "firebase/database";
import { Timestamp } from "firebase/firestore";
import { MyUser } from "./userState.svelte";
import { ChatStore } from "./ChatList.svelte";
import { format } from "prettier";

export class Chat {
  private _messages = $state<message[]>([]);
  private _chatInfo = $state<chatInfo>();
  private currentUnsubscriber: (() => void) | null;
  private _to: string;
  private _id = $state<string>();

  constructor(id: string, to: string, chatInfo: chatInfo) {
    this._id = id;
    this.currentUnsubscriber = null;
    this._chatInfo = chatInfo;

    this._to = to;
  }

  get messages() {
    if (this.currentUnsubscriber) return this._messages;

    console.log("CHAT ID " + this.id);

    this.currentUnsubscriber = onChildAdded(
      ref(realtimeDB, "messages/" + this._id),
      (snapshot) => {
        if (Number(snapshot.key) == this._messages.length) {
          this._messages.push(snapshot.val() as message);
          console.log(snapshot.key);
        } else {
          console.log(snapshot.val().text);
        }
      },
    );

    return this._messages;
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

  async loadMoreMessages() {
    const q = query(
      ref(realtimeDB, "messages/" + this._id),
      limitToLast(20),
      startAfter(this._messages[this._messages.length].timestamp),
    );

    const result = get(q);

    (await result).forEach((message) => {
      this._messages.push(message.val());
    });
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

    console.log(this._id);

    //this._chatInfo = { lastMessage: text, timestamp: strDate };

    set(ref(realtimeDB, "messages/" + this._id + "/" + this._messages.length), {
      text: text,
      timestamp: strDate,
      sender: MyUser.getUser().userInfo!.Username,
    });
  }
}
