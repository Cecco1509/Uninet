import { db } from "$lib/firebase/firebase.client";
import {
  query,
  collection,
  where,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { UserInfoObject } from "../userInfo.svelte";

type UserInfoMap = {
  [key: string]: UserInfoObject;
};

export class UserInfosCache {
  private userInfos: UserInfoMap = {};

  private static instance: UserInfosCache;

  static getCache() {
    if (!this.instance) this.instance = new UserInfosCache();
    return this.instance;
  }

  constructor() {}

  getUserInfo(username: string): UserInfoObject {
    if (this.userInfos[username] && this.userInfos[username].data) {
      return this.userInfos[username];
    }

    const q = query(collection(db, "Users"), where("Username", "==", username));

    if (this.userInfos[username] == null) {
      this.userInfos[username] = new UserInfoObject(null, "", getDocs(q));
    }

    return this.userInfos[username];
  }
}
