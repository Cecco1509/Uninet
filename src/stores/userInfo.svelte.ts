import type {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

export class UserInfoObject {
  private _data = $state<UserInfo | null>(null);
  private _id: string;
  private _promise: Promise<QuerySnapshot>;

  constructor(data: UserInfo, id: string, promise: Promise<QuerySnapshot>) {
    this._data = data;
    this._id = id;
    this._promise = promise;
    promise.then((data) => {
      data.forEach((user) => {
        (this._data = user.data() as UserInfo), (this._id = user.id);
      });
    });
  }

  get data() {
    return this._data;
  }
  get id() {
    return this._id;
  }

  set data(data: UserInfo) {
    this._data = data;
  }

  set id(id: string) {
    this._id = id;
  }

  async waitForComplete(): Promise<UserInfo> {
    await this._promise;
    console.log("ID" + this._id);
    return { ...this._data!, id: this._id };
  }
}
