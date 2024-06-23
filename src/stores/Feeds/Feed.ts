import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import type { FeedObject } from "../FeedElements/FeedObject";

export interface Feed {
  fetchedAll: boolean;

  getElements(): Promise<FeedElement<FeedObject>[]>;
  loadMore(): Promise<void>;
}

export interface Delete {
  delete(id: string, deleteFromDB: boolean): void;
}

export interface Add {
  add(new_element: FeedElement<FeedObject>): void;
}

export interface Send {
  send(text: string): void;
}
