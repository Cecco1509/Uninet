import { remove, type DatabaseReference } from "firebase/database";
import type { messageFeedObject } from "./FeedObject";
import { FeedElement } from "./FeedElement.svelte";

export abstract class FeedMessageElement<
  T extends messageFeedObject,
> extends FeedElement<T> {
  protected ref: DatabaseReference;
  constructor(reference: DatabaseReference, data: T, id: string) {
    super(data, id);
    this.ref = reference;
  }

  async edit<T extends messageFeedObject>(edits: Partial<T>) {
    // FETCH LIKE SHIT
  }

  async delete() {
    try {
      remove(this.ref);
    } catch (e) {
      console.log(e);
    }
  }
}
