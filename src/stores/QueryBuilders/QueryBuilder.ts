import type { Query } from "firebase/firestore";
import type { FeedObject } from "../FeedElements/FeedObject";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export interface QueryBuilder {
  collection: string;
  loadSize: number;
  getQuery(): Promise<Query | null>;
  getFetchQuery<T extends FeedObject>(
    element: FeedElement<T>
  ): Promise<Query | null>;
}
