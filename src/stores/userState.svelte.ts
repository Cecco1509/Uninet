import { auth, db } from "$lib/firebase/firebase.client";
import type { User } from "firebase/auth";
import {
  FirestoreError,
  Transaction,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { UserInfosCache } from "./caches/UserInfosCache.svelte";

type friends = {
  [key: string]: string | undefined;
};

export class MyUser {
  private _user = $state<User | null | undefined>(undefined);
  private _userInfo = $state<UserInfo | null | undefined>(undefined);
  private isUserLoading = $state(true);
  private isInfoLoading = $state(true);
  private _isLoading = $derived(this.isInfoLoading || this.isUserLoading);
  private _friends = $state<friends>({});
  private _friendsSize = 0;

  private static instance: MyUser | null = null;

  public static getUser(): MyUser {
    if (!MyUser.instance) MyUser.instance = new MyUser();
    return MyUser.instance;
  }

  private constructor() {
    $effect(() => {
      this.isUserLoading = true;
      let fn = auth.onAuthStateChanged((new_user) => {
        this._user = new_user;
        this.isUserLoading = false;
      });

      return () => fn?.();
    });

    $effect(() => {
      this.isInfoLoading = true;
      if (this.isUserLoading) return;
      if (!this._user) {
        this.isInfoLoading = false;
        return;
      }
      let unsubscribe = onSnapshot(
        doc(db, "Users", this._user.uid),
        (doc) => {
          this._userInfo = doc.data() as UserInfo;
          this.isInfoLoading = false;
        },
        (err) => {
          console.log(err);
        },
        () => {}
      );

      return () => {
        try {
          unsubscribe?.();
        } catch (e) {
          console.log((e as FirestoreError).code);
        }
      };
    });
  }

  get userInfo() {
    return this._userInfo;
  }

  get user() {
    return this._user;
  }

  get isLoading() {
    return this._isLoading;
  }

  async getFriends(): Promise<string[]> {
    if (this._friendsSize > 0) {
      return Object.keys(this._friends);
    }

    const result = await getDocs(
      query(
        collection(db, "Friends"),
        where("username", "==", this._userInfo!.Username)
      )
    );

    result.forEach((friend) => {
      this._friends[friend.data().friendUsername] = friend.id;
      this._friendsSize++;
    });

    return Object.keys(this._friends);
  }

  async addPost() {
    await updateDoc(doc(db, "Users", this._user!.uid), {
      posts: this._userInfo!.posts + 1,
    });
  }

  async isFriend(username: string): Promise<boolean> {
    await this.getFriends();

    console.log(this._friends);

    return this._friends[username] != undefined ? true : false;
  }

  async follow(username: string): Promise<void> {
    if (this._friends[username]) {
      await runTransaction(db, async (transaction) => {
        transaction.update(doc(db, "Users", this._user!.uid), {
          seguiti: this.userInfo!.seguiti - 1,
        });
        let f_user = await UserInfosCache.getCache()
          .getUserInfo(username)
          .waitForComplete();
        transaction.update(doc(db, "Users", f_user!.id), {
          Followers: f_user!.Followers - 1,
        });
        f_user!.Followers -= 1;
      });

      await deleteDoc(doc(db, "Friends", this._friends[username]!));
      this._friends[username] = undefined;

      return;
    }

    let res = await addDoc(collection(db, "Friends"), {
      username: this._userInfo?.Username,
      friendUsername: username,
    });
    if (!res) return;

    //ADD 1 FOLLOWER E 1 SEGUITO

    await runTransaction(db, async (transaction) => {
      transaction.update(doc(db, "Users", this._user!.uid), {
        seguiti: this.userInfo!.seguiti + 1,
      });
      let f_user = await UserInfosCache.getCache()
        .getUserInfo(username)
        .waitForComplete();
      console.log(f_user);
      transaction.update(doc(db, "Users", f_user!.id), {
        Followers: f_user!.Followers + 1,
      });
      f_user!.Followers += 1;
    });

    this._friends[username] = res.id;
    return;
  }
}
