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
import type { FeedObject } from "../FeedElements/FeedObject";
import { MyUser } from "../userState.svelte";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export class DiscoveryQueryBuilder implements QueryBuilder {
  private param: Promise<string[]>;
  public collection: string;
  public loadSize: number;

  constructor(
    collection: string,
    param: Promise<string[]>,
    loadSize: number = 10
  ) {
    this.param = param;
    this.collection = collection;
    this.loadSize = loadSize;
  }

  async getFetchQuery(element: FeedElement<FeedObject>): Promise<Query | null> {
    const result = await this.param;
    result.push(MyUser.getUser().userInfo!.Username);

    return query(
      collection(db, this.collection),
      where("createdBy", "not-in", result),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      startAfter(element.data.data),
      limit(this.loadSize)
    );
  }

  async getQuery(): Promise<Query | null> {
    const result = await this.param;
    result.push(MyUser.getUser().userInfo!.Username);

    return query(
      collection(db, this.collection),
      where("createdBy", "not-in", result),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      limit(this.loadSize)
    );
  }
}
