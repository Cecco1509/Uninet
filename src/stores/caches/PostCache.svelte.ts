import { db } from "$lib/firebase/firebase.client";
import {
  query,
  collection,
  where,
  getDocs,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { Post } from "../FeedElements/Post.svelte";
import { PostsFeed } from "../Feeds/PostsFeed.svelte";
import { DiscoveryQueryBuilder } from "../QueryBuilders/DiscoveryQueryBuilder";
import { HomeFeedQueryBuilder } from "../QueryBuilders/HomeFeedQueryBuilder";
import { UserFeedQueryBuilder } from "../QueryBuilders/UserFeedQueryBuilder";
import { MyUser } from "../userState.svelte";
import type { FeedsCache } from "./Cache";
import type { Feed } from "../Feeds/Feed";

type UsersFeedMap = {
  [key: string]: PostsFeed;
};

type UserInfoMap = {
  [key: string]: UserInfo;
};

export class PostCache implements FeedsCache {
  private usersFeedMap: UsersFeedMap = {};
  private _homeFeed: PostsFeed | null = null;
  private _discoveryFeed: PostsFeed | null = null;
  private userInfos: UserInfoMap = {};

  private static instance: PostCache;

  private constructor() {}

  static getCache() {
    if (!this.instance) {
      this.instance = new PostCache();
    }
    return this.instance;
  }

  getUserFeed(userId: string) {
    if (!this.usersFeedMap[userId])
      this.usersFeedMap[userId] = new PostsFeed(
        new UserFeedQueryBuilder("Posts", userId)
      );
    return this.usersFeedMap[userId];
  }

  getHomeFeed() {
    if (!this._homeFeed)
      this._homeFeed = new PostsFeed(
        new HomeFeedQueryBuilder("Posts", MyUser.getUser().getFriends())
      );
    else console.log("not feed");
    return this._homeFeed;
  }

  getDiscoveryFeed() {
    if (!this._discoveryFeed)
      this._discoveryFeed = new PostsFeed(
        new DiscoveryQueryBuilder("Posts", MyUser.getUser().getFriends())
      );
    else console.log("not feed");
    return this._discoveryFeed;
  }

  deletePost(postId: string): void {
    this.getHomeFeed().delete(postId, false);
    this.usersFeedMap[MyUser.getUser()!.userInfo!.Username].delete(
      postId,
      true
    );
  }

  async publishPost(postText: string, photoUrl: string) {
    const newPostSchema: PostSchema = {
      data: Timestamp.fromDate(new Date()),
      text: postText,
      likes: 0,
      comments: 0,
      img: photoUrl,
      userID: MyUser.getUser().user!.uid,
      createdBy: MyUser.getUser().userInfo!.Username,
    };

    try {
      const ref = await addDoc(collection(db, "Posts"), newPostSchema);

      const newPost = new Post(ref, newPostSchema, ref.id);
      //Aggiungo al feed il post appena creato
      this.getHomeFeed().add(newPost);

      //Aggiungo all'array dei post il post appena creato
      if (this.usersFeedMap[MyUser.getUser().userInfo!.Username])
        this.usersFeedMap[MyUser.getUser().userInfo!.Username].add(newPost);

      await MyUser.getUser().addPost();
      console.log("ADD request");
    } catch (e) {
      console.log("Errore", e);
    }
  }
}
