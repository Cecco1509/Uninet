import { db, storage } from "$lib/firebase/firebase.client";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from "firebase/firestore";
import { MyUser } from "../userState.svelte";
import type { NumericRange } from "@sveltejs/kit";
import { getDownloadURL, ref } from "firebase/storage";
import { HomeFeedQueryBuilder } from "../QueryBuilders/HomeFeedQueryBuilder";
import { DiscoveryQueryBuilder } from "../QueryBuilders/DiscoveryQueryBuilder";
import { UserFeedQueryBuilder } from "../QueryBuilders/UserFeedQueryBuilder";
import { Volantino } from "../FeedElements/Volantino.svelte";
import { VolantiniFeed } from "../Feeds/VolantiniFeed.svelte";
import type { FeedsCache } from "./Cache";
import type { Feed } from "../Feeds/Feed";

type userMap = {
  [key: string]: VolantiniFeed;
};

export class CacheVolantini implements FeedsCache {
  private _cache = $state<VolantiniFeed>(); // Volantini di chi segue
  private _usersCache = $state<userMap>({}); // Volantini degli utenti volantini
  private _discover = $state<VolantiniFeed>(); // Volantini più recenti e popolari

  private static instance: CacheVolantini | null = null;

  static getCache(): CacheVolantini {
    if (!this.instance) this.instance = new CacheVolantini();
    return this.instance!;
  }

  constructor() {}

  getHomeFeed() {
    if (!this._cache)
      this._cache = new VolantiniFeed(
        new HomeFeedQueryBuilder("Volantini", MyUser.getUser().getFriends())
      );
    return this._cache;
  }

  getDiscoveryFeed() {
    if (!this._discover)
      this._discover = new VolantiniFeed(
        new DiscoveryQueryBuilder("Volantini", MyUser.getUser().getFriends())
      );
    return this._discover;
  }

  getUserFeed(user: string) {
    if (!this._usersCache[user])
      this._usersCache[user] = new VolantiniFeed(
        new UserFeedQueryBuilder("Volantini", user)
      );
    return this._usersCache[user];
  }

  async publishVolantino(img: string, titolo: string, tagList: string[]) {
    const new_volantino = {
      createdBy: MyUser.getUser().userInfo!.Username,
      data: Timestamp.fromDate(new Date()),
      img: img,
      tags: tagList.reduce((prev, curr, i, arr) => {
        if (i == 0) return curr;
        return prev + "," + curr;
      }, ""),
      text: titolo,
      likes: 0,
    };

    const ref = await addDoc(collection(db, "Volantini"), new_volantino);

    const volantino: Volantino = new Volantino(ref, new_volantino, ref.id);

    this._usersCache[MyUser.getUser().userInfo!.Username].add(volantino);
    this.getHomeFeed().add(volantino);
  }

  delete(id: string): void {
    this.getHomeFeed().delete(id, false);
    this._usersCache[MyUser.getUser()!.userInfo!.Username].delete(id, true);
  }

  // async addVolantino(new_volantino: Volantino) {
  //   const url = await getDownloadURL(ref(storage, new_volantino.img));

  //   new_volantino.img = url;

  //   this._cache = [new_volantino, ...this._cache];
  //   this._usersCache[MyUser.getUser().userInfo!.Username] = [new_volantino, ...this._usersCache[MyUser.getUser().userInfo!.Username]];
  // }
}
/*
  const q = query(
    collection(db, "/Volantini"),
    where("createdBy", "==", user),
    orderBy("data", "desc"),
    limit(10)
  );
*/
