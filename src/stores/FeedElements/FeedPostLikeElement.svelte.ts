import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, deleteDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import type { FeedObject, FeedPostLikeObject } from "./FeedObject";
import { FeedElement } from "./FeedElement.svelte";

export abstract class FeedPostLikeElement<
  T extends FeedPostLikeObject,
> extends FeedElement<T> {
  protected ref: DocumentReference;
  private imgPath: string = "";

  constructor(reference: DocumentReference, data: T, id: string) {
    super(data, id);
    this.ref = reference;

    if (!this._data!.img) return;

    this.imgPath = this._data!.img;
    this._data!.img = "";

    getDownloadURL(ref(storage, this.imgPath))
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
      if (this.imgPath) deleteObject(ref(storage, this.imgPath));
      deleteDoc(this.ref);
    } catch (e) {
      console.log(e);
    }
  }
}
