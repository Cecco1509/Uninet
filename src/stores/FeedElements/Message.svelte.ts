import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { update, type DatabaseReference } from "firebase/database";
import { FeedElement } from "./FeedElement.svelte";

export class Message extends FeedElement {
  private ref: DatabaseReference;

  constructor(reference: DatabaseReference, data: MessageSchema, id: string) {
    super(data, id);
    this.ref = reference;
  }

  async edit(edits: Partial<MessageSchema>) {
    try {
      await update(this.ref, edits);
      this._data = { ...this._data!, ...edits };
    } catch (e) {
      console.log("Not Updated", e);
    }
  }
}
