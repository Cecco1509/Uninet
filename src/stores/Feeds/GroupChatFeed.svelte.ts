import { db, realtimeDB } from "$lib/firebase/firebase.client";
import {
  onChildAdded,
  onValue,
  ref,
  set,
  query,
  onChildRemoved,
  type Query,
  get,
  orderByKey,
  limitToLast,
  startAfter,
  endBefore,
  startAt,
} from "firebase/database";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { MyUser } from "../userState.svelte";
import { ChatCache } from "../caches/ChatCache.svelte";
import type { IFeed, Send } from "./IFeed";
import { Message } from "../FeedElements/Message.svelte";
import type { IFeedElementFactory } from "../Factories/IFeedElementFactory";
import type { ChatQueryBuilder } from "../QueryBuilders/ChatQueryBuilder";
import type { MessageFactory } from "../Factories/MessageFactory";
import { Chat } from "./Chat.svelte";

export class GroupChatFeed extends Chat implements Send {
  private _chatInfo = $state<groupChatInfo>();
  private _partecipants = $state<{ name: string; timestamp: string }[]>([]);
  private partecipantsUnsubscribe: (() => void) | undefined;

  constructor(
    id: string,
    chatInfo: groupChatInfo,
    queryBuilder?: ChatQueryBuilder,
    factory?: MessageFactory
  ) {
    super(id, queryBuilder, factory);
    this._chatInfo = chatInfo;
  }

  get chatInfo() {
    return this._chatInfo!;
  }

  set chatInfo(info: groupChatInfo) {
    this._chatInfo = info;
  }

  async getElements(): Promise<Message[]> {
    if (this._elements.length > 0) return this._elements as Message[];

    const q = query(
      ref(realtimeDB, "groupsMessages/" + this.chatInfo.name),
      orderByKey(),
      limitToLast(30)
    );

    const result = await get(q);

    result.forEach((message) => {
      this._elements.push(
        new Message(message.ref, message.val(), message.key!)
      );
    });

    this._fetchedAll = this._elements.length < this._queryBuilder!.loadSize;

    if (!this.currentUnsubscriber) {
      let q1: Query | null = null;
      if (this._elements.length > 0) {
        q1 = query(
          ref(realtimeDB, "groupsMessages" + "/" + this.chatInfo.name),
          orderByKey(),
          startAfter(this._elements[this._elements.length - 1].id)
        );
      }

      this.currentUnsubscriber = onChildAdded(
        q1 ? q1 : ref(realtimeDB, "groupsMessages/" + this._chatInfo?.name),
        (message) => {
          this._elements.push(
            new Message(message.ref, message.val(), message.key!)
          );
        }
      );
    }

    return this._elements as Message[];
  }

  async loadMore(): Promise<void> {
    if (this._fetchedAll) return;

    const start =
      Number(
        this._newElements.length > 0
          ? this._newElements[0].id
          : this._elements[0].id
      ) - this._queryBuilder!.loadSize;
    const end: string =
      this._newElements.length > 0
        ? this._newElements[0].id
        : this._elements[0].id;

    console.log("startAt", start, "endBefore", end, this.chatInfo.name);

    const q = query(
      ref(realtimeDB, "groupsMessages" + "/" + this.chatInfo.name),
      orderByKey(),
      startAt(start > 0 ? "" + start : "0"),
      endBefore(end)
    );

    const result = await get(q);
    let newMessages: Message[] = [];

    result.forEach((message) => {
      newMessages.push(new Message(message.ref, message.val(), message.key));
      console.log(message.key);
    });

    if (this._newElements.length == 0) this._newElements = newMessages;
    else {
      this._elements = [...this._newElements, ...this._elements];
      this._newElements = newMessages;
    }

    this._fetchedAll = newMessages[0].id == "0";
  }

  async getPartecipants() {
    if (this._partecipants.length > 0) return this._partecipants;

    const q = query(
      ref(realtimeDB, "groupsPartecipants/" + this.chatInfo.name)
    );

    this.partecipantsUnsubscribe = onValue(q, (snapshot) => {
      snapshot.forEach((partecipant) => {
        if (partecipant.val() == null) {
          this._partecipants.filter((p) => {
            p.name != partecipant.key!;
          });
        } else
          this._partecipants.push({
            name: partecipant.key!,
            timestamp: partecipant.val().timestamp,
          });
      });
    });

    return this._partecipants;
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

    await ChatCache.getCache().setLastGroupMessage(this.chatInfo.name, {
      lastMessage: text,
      timestamp: strDate,
    });

    // The chat has been added before this method will run

    //this._chatInfo = { lastMessage: text, timestamp: strDate };

    let id = 0;
    if (this._elements.length > 0)
      id = Number(this._elements[this._elements.length - 1].id) + 1;

    console.log(id);
    const newMessage: MessageSchema = {
      text: text,
      timestamp: strDate,
      sender: MyUser.getUser().userInfo!.Username,
    };
    console.log("groupsMessages/", this.chatInfo.name, id, newMessage);

    await set(
      ref(realtimeDB, "groupsMessages/" + this.chatInfo.name + "/" + "" + id),
      newMessage
    );
  }
}
