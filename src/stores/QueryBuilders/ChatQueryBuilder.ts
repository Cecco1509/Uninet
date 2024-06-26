import {
  type Query,
  query,
  startAfter,
  ref,
  orderByKey,
  startAt,
  endBefore,
  limitToLast,
} from "firebase/database";
import type { QueryBuilder } from "./QueryBuilder";
import { db, realtimeDB } from "$lib/firebase/firebase.client";
import { MyUser } from "../userState.svelte";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export class ChatQueryBuilder {
  private param: string;
  public collection: string;
  public loadSize: number;
  private id: string;

  constructor(
    collection: string,
    id: string,
    param: string,
    loadSize: number = 10
  ) {
    this.param = param;
    this.collection = collection;
    this.loadSize = loadSize;
    this.id = id;
  }

  async getFetchQuery(start: number, end: string): Promise<Query> {
    return query(
      ref(realtimeDB, this.collection + "/" + this.id),
      orderByKey(),
      startAt(start > 0 ? "" + start : "0"),
      endBefore(end)
    );
  }

  async getQuery(): Promise<Query> {
    console.log("getQuery", this.collection, this.id);
    return query(
      ref(realtimeDB, this.collection + "/" + this.id),
      orderByKey(),
      limitToLast(this.loadSize)
    );
  }

  getListeningQuery(start: string): Query | null {
    return query(
      ref(realtimeDB, this.collection! + "/" + this.id),
      orderByKey(),
      startAfter(start)
    );
  }
}
