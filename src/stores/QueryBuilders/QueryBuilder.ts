import type { Query } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export interface QueryBuilder {
  collection: string;
  loadSize: number;
  getQuery(): Promise<Query | null>;
  getFetchQuery(element: FeedElement): Promise<Query | null>;
}
