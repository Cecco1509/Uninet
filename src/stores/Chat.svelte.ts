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
  startAt,
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

  private static pageSize: number = 20;

  constructor(id: string, to: string, chatInfo: chatInfo) {
    this._id = id;
    this.currentUnsubscriber = null;
    this._chatInfo = chatInfo;

    this._to = to;
  }

  async getMessages(): Promise<message[]> {
    if (this.currentUnsubscriber || this._messages.length > 0)
      return this._messages;

    console.log("CHAT ID " + this._id);

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
      console.log(Number(snapshot.key), this._messages.length);
      console.log("TESTO", snapshot.val().text);
    });

    const q1 = query(
      ref(realtimeDB, "messages/" + this._id),
      orderByKey(),
      startAfter(this._messages[this._messages.length - 1].id),
    );

    this.currentUnsubscriber = onChildAdded(q1, (snapshot) => {
      this._messages.push({
        ...(snapshot.val() as message),
        id: snapshot.key!,
      });
    });

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
      startAfter(this._messages[this._messages.length - 1].timestamp),
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

    console.log(Number(this._messages[this._messages.length - 1].id) + 1);

    //this._chatInfo = { lastMessage: text, timestamp: strDate };

    set(
      ref(
        realtimeDB,
        "messages/" +
          this._id +
          "/" +
          (Number(this._messages[this._messages.length - 1].id) + 1),
      ),
      {
        text: text,
        timestamp: strDate,
        sender: MyUser.getUser().userInfo!.Username,
      },
    );
  }
}
