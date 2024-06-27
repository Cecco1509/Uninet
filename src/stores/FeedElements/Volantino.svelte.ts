import { storage } from "$lib/firebase/firebase.client";
import { deleteDoc, DocumentReference, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { FeedElement } from "./FeedElement.svelte";
import { MenuStore } from "../Menu.svelte";

export class Volantino extends FeedElement {
  private ref: DocumentReference;
  private imgPath: string = "";

  constructor(reference: DocumentReference, data: VolantinoSchema, id: string) {
    super(data, id);
    this.ref = reference;

    if (!this._data!.img) return;

    this.imgPath = this._data!.img;
    this._data!.img = "";

    if (!MenuStore.getMenu().offline)
      getDownloadURL(ref(storage, this.imgPath))
        .then((url) => {
          this._data!.img = url;
        })
        .catch((e) => {
          console.log(e);
        });
  }

  get data() {
    return this._data as VolantinoSchema;
  }

  async edit(edits: Partial<VolantinoSchema>) {
    try {
      if (edits.img && this._data?.img)
        await deleteObject(ref(storage, this._data.img));

      await updateDoc(this.ref, edits);
      this._data = { ...this._data!, ...edits };
    } catch (e) {
      console.log(e);
    }
  }

  async delete(): Promise<void> {
    try {
      await deleteDoc(this.ref);
    } catch (e) {
      console.log(e);
    }
  }
}
