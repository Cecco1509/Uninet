import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import type { FeedObject } from "./FeedObject";

export abstract class FeedElement<T extends FeedObject> {
  protected _data = $state<T>();
  protected _id: string;
  protected ref: DocumentReference;

  constructor(reference: DocumentReference, data: T, id: string) {
    this.ref = reference;
    this._data = data;
    this._id = id;

    if (!this._data.img) return;

    const imgPath = this._data.img;
    this._data.img = "";

    getDownloadURL(ref(storage, imgPath))
      .then((url) => {
        this._data!.img = url;
      })
      .catch((e) => {
        console.log(e);
      });
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

  async delete() {
    try {
      deleteDoc(this.ref);
    } catch (e) {
      console.log(e);
    }
  }
}
