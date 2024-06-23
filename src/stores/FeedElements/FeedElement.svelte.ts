import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import type { FeedObject } from "./FeedObject";

export abstract class FeedElement<T extends FeedObject> {
  protected _data = $state<T>();
  protected _id: string;

  constructor(data: T, id: string) {
    this._data = data;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }
  get data() {
    return this._data!;
  }

  async edit<T extends FeedObject>(edits: Partial<T>) {
    // FETCH LIKE SHIT
  }
}
