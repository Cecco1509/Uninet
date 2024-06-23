import { storage } from "$lib/firebase/firebase.client";
import { DocumentReference, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { FeedElement } from "./FeedElement.svelte";

export class Volantino extends FeedElement<VolantinoSchema> {
  constructor(reference: DocumentReference, data: VolantinoSchema, id: string) {
    super(reference, data, id);
  }

  async edit(edits: Partial<VolantinoSchema>) {
    try {
      if (edits.img && this._data?.img)
        await deleteObject(ref(storage, this._data.img));

      await updateDoc(this.ref, edits);
      this._data = { ...this._data!, ...edits };
    } catch (e) {
      console.log("Not Updated", e);
    }
  }
}
