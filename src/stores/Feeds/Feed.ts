import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import type { FeedObject } from "../FeedElements/FeedObject";

export interface Feed {
  fetchedAll: boolean;

  getElements(): Promise<FeedElement<FeedObject>[]>;
  loadMore(): Promise<boolean>;
  add(new_element: FeedElement<FeedObject>): void;
  delete(id: string, deleteFromDB: boolean): void;
}
