import { db } from "$lib/firebase/firebase.client";
import { query, collection, where, getDocs } from "firebase/firestore";

type UserInfoMap = {
  [key: string]: UserInfo;
};

export class UserInfosCache {
  private userInfos: UserInfoMap = $state({});

  private static instance: UserInfosCache;

  static getCache() {
    if (!this.instance) this.instance = new UserInfosCache();
    return this.instance;
  }

  constructor() {}

  async getUserInfo(username: string): Promise<UserInfo> {
    if (this.userInfos[username]) {
      console.log("not info");
      return this.userInfos[username];
    }

    console.log(this.userInfos[username], username);
    const q = query(collection(db, "Users"), where("Username", "==", username));
    const result = await getDocs(q);
    let userData: UserInfo | null = null;

    if (result.empty) return null;
    result.forEach((row) => {
      userData = { ...row.data(), id: row.id } as UserInfo;
    });

    this.userInfos[username] = userData;
    return userData;
  }
}
