import type { Query } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import type { FeedObject } from "../FeedElements/FeedObject";

export interface QueryBuilder {
  collection: string;
  loadSize: number;
  getQuery(): Promise<Query | null>;
  getFetchQuery<T extends FeedObject>(
    element: FeedElement<T>
  ): Promise<Query | null>;
}
