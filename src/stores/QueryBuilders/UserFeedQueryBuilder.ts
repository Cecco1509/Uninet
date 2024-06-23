import {
  type Query,
  type DocumentData,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import type { QueryBuilder } from "./QueryBuilder";
import { db } from "$lib/firebase/firebase.client";
import { MyUser } from "../userState.svelte";
import type { FeedObject } from "../FeedElements/FeedObject";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export class UserFeedQueryBuilder implements QueryBuilder {
  private param: string;
  public collection: string;
  public loadSize: number;

  constructor(collection: string, param: string, loadSize: number = 10) {
    this.param = param;
    this.collection = collection;
    this.loadSize = loadSize;
  }

  async getFetchQuery(element: FeedElement<FeedObject>): Promise<Query> {
    return query(
      collection(db, this.collection),
      where("createdBy", "==", this.param),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      startAfter(element.data.data),
      limit(this.loadSize)
    );
  }

  async getQuery(): Promise<Query> {
    return query(
      collection(db, this.collection),
      where("createdBy", "==", this.param),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      limit(this.loadSize)
    );
  }
}
