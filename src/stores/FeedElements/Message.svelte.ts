import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { update, type DatabaseReference } from "firebase/database";
import { FeedMessageElement } from "./FeedChatLikeElement.svelte";

export class Message extends FeedMessageElement<MessageSchema> {
  constructor(reference: DatabaseReference, data: MessageSchema, id: string) {
    super(reference, data, id);
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
