import { type DocumentData } from "firebase/firestore";

export abstract class FeedElement {
  protected _data = $state<DocumentData>();
  protected _id: string;

  constructor(data: DocumentData, id: string) {
    this._data = data;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }
  get data() {
    return this._data!;
  }

  async edit<T extends DocumentData>(edits: Partial<T>) {
    // FETCH LIKE SHIT
  }

  async delete() {}
}
