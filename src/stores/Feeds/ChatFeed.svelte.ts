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
import { MyUser } from "../userState.svelte";
import { ChatCache } from "../caches/ChatCache.svelte";
import type { IFeed, Send } from "./IFeed";
import { Message } from "../FeedElements/Message.svelte";
import type { IFeedElementFactory } from "../Factories/IFeedElementFactory";
import type { ChatQueryBuilder } from "../QueryBuilders/ChatQueryBuilder";
import type { MessageFactory } from "../Factories/MessageFactory";
import { Chat } from "./Chat.svelte";

export class ChatFeed extends Chat implements Send {
  private _chatInfo = $state<chatInfo>();
  private _to: string;

  constructor(id: string, to: string, chatInfo: chatInfo) {
    super(id);
    this._chatInfo = chatInfo;
    this._to = to;
  }

  get chatInfo() {
    return this._chatInfo!;
  }

  set chatInfo(info: chatInfo) {
    this._chatInfo = info;
  }

  get to() {
    return this._to;
  }

  async send(text: string) {
    const strDate = ChatCache.getNowString();

    await ChatCache.getCache().setLastMessage(
      this.to,
      { lastMessage: text, timestamp: strDate },
      this._id == "" ? this : null
    );

    //this._chatInfo = { lastMessage: text, timestamp: strDate };

    let id = 0;
    if (this._freshMessages.length > 0)
      id = Number(this._freshMessages[this._freshMessages.length - 1].id) + 1;
    else if (this._elements.length > 0)
      id = Number(this._elements[this._elements.length - 1].id) + 1;

    if (this._elements.length == 0)
      this.currentUnsubscriber = this.getUnsubscriber();

    await set(ref(realtimeDB, "messages/" + this._id + "/" + id), {
      text: text,
      timestamp: strDate,
      sender: MyUser.getUser().userInfo!.Username,
    });
  }
}
