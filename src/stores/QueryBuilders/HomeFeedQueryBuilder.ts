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
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export class HomeFeedQueryBuilder implements QueryBuilder {
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

  async getFetchQuery(element: FeedElement): Promise<Query | null> {
    const result = await this.param;
    if (!result || result.length == 0) return null;

    return query(
      collection(db, this.collection),
      where("createdBy", "in", result),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      startAfter(element.data.data),
      limit(this.loadSize)
    );
  }

  async getQuery(): Promise<Query | null> {
    const result = await this.param;
    if (!result || result.length == 0) return null;

    return query(
      collection(db, this.collection),
      where("createdBy", "in", result),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      limit(this.loadSize)
    );
  }
}
