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

export abstract class Chat implements IFeed {
  protected _elements = $state<Message[]>([]);
  protected _newElements = $state<Message[]>([]);
  protected currentUnsubscriber: (() => void) | undefined;
  protected _id = $state<string>();
  protected _queryBuilder: ChatQueryBuilder | undefined;
  protected _factory: MessageFactory | undefined;
  protected _fetchedAll: boolean = $state(false);
  protected _freshMessages = $state<Message[]>([]);

  set queryBuilder(q: ChatQueryBuilder) {
    this._queryBuilder = q;
  }

  set factory(f: MessageFactory) {
    this._factory = f;
  }

  get freshMessages() {
    return this._freshMessages;
  }

  constructor(
    id: string,
    queryBuilder?: ChatQueryBuilder,
    factory?: MessageFactory
  ) {
    this._queryBuilder = queryBuilder;
    this._factory = factory;
    this._id = id;
    this._fetchedAll = true;

    //if (this._id) this.currentUnsubscriber = this.getUnsubscriber();
  }

  async getElements(): Promise<Message[]> {
    if (this._elements.length > 0) return this._elements as Message[];

    const q = query(
      ref(realtimeDB, "messages/" + this.id),
      orderByKey(),
      limitToLast(30)
    );
    const result = await get(q);

    result.forEach((snapshot) => {
      this._elements.push(
        this._factory!.create(snapshot.ref, snapshot.val(), snapshot.key!)
      );
    });

    this._fetchedAll = this._elements.length < this._queryBuilder!.loadSize;

    if (this._elements.length > 0 && !this.currentUnsubscriber)
      this.currentUnsubscriber = this.getUnsubscriber();

    return this._elements as Message[];
  }

  protected getUnsubscriber(): () => void {
    console.log("getUnsubscriber Called", this._id);
    let q1: Query | null = null;

    if (this._elements.length > 0) {
      q1 = query(
        ref(realtimeDB, "messages" + "/" + this._id),
        orderByKey(),
        startAfter(this._elements[this._elements.length - 1].id)
      );
    }

    return onChildAdded(
      q1 ? q1 : ref(realtimeDB, "messages/" + this._id),
      (message) => {
        console.log(
          "Message created: " + message.val(),
          this._queryBuilder?.collection,
          this._id
        );
        this._freshMessages.push(
          new Message(message.ref, message.val(), message.key!)
        );

        console.log(this._freshMessages);
      }
    );
  }

  get newMessages() {
    return this._newElements;
  }

  setId(arg0: string) {
    this._id = arg0;
  }

  get id() {
    return this._id;
  }

  get fetchedAll() {
    return this._fetchedAll;
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

    console.log("startAt", start, "endBefore", end);

    const q = query(
      ref(realtimeDB, "messages" + "/" + this.id),
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

  //   async send(text: string) {
  //     const date = new Date();

  //     const strDate =
  //       date.getHours().toString().padStart(2, "0") +
  //       ":" +
  //       date.getMinutes().toString().padStart(2, "0") +
  //       " " +
  //       date.getDate().toString().padStart(2, "0") +
  //       "/" +
  //       date.getMonth().toString().padStart(2, "0") +
  //       "/" +
  //       date.getFullYear();

  //     await ChatCache.getCache().setLastMessage(
  //       this.to,
  //       { lastMessage: text, timestamp: strDate },
  //       this._id == "" ? this : null
  //     );

  //     //this._chatInfo = { lastMessage: text, timestamp: strDate };

  //     let id = 0;
  //     if (this._newElements.length == 0 && this._elements.length > 0)
  //       id = Number(this._elements[this._elements.length - 1].id) + 1;
  //     else if (this._newElements.length > 0)
  //       id = Number(this._elements[this._elements.length - 1].id) + 1;

  //     await set(ref(realtimeDB, "messages/" + this._id + "/" + id), {
  //       text: text,
  //       timestamp: strDate,
  //       sender: MyUser.getUser().userInfo!.Username,
  //     });

  //     if (this._elements.length == 0)
  //       this.currentUnsubscriber = this.getUnsubscriber();
  //   }
}
