import type { DocumentData, DocumentReference } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";

export interface IFeed {
  fetchedAll: boolean;

  getElements(): Promise<FeedElement[]>;
  loadMore(): Promise<void>;
}

export interface Delete {
  delete(id: string, deleteFromDB: boolean): void;
}

export interface Add {
  add(element: FeedElement): void;
}

export interface Send {
  send(text: string): void;
}
