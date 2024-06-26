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
import { DiscoveryQueryBuilder } from "../QueryBuilders/DiscoveryQueryBuilder";
import { HomeFeedQueryBuilder } from "../QueryBuilders/HomeFeedQueryBuilder";
import { UserFeedQueryBuilder } from "../QueryBuilders/UserFeedQueryBuilder";
import { MyUser } from "../userState.svelte";
import type { FeedsCache } from "./Cache";
import { Feed } from "../Feeds/Feed.svelte";
import { FeedPostFactory } from "../Factories/FeedPostFactory";

type UsersFeedMap = {
  [key: string]: Feed;
};

export class PostCache implements FeedsCache {
  static delete() {
    this.instance._discoveryFeed = null;
    this.instance._homeFeed = null;
  }
  private usersFeedMap: UsersFeedMap = {};
  private _homeFeed: Feed | null = null;
  private _discoveryFeed: Feed | null = null;
  private factory: FeedPostFactory;

  private static instance: PostCache;

  private constructor() {
    this.factory = new FeedPostFactory();
  }

  static getCache() {
    if (!this.instance) {
      this.instance = new PostCache();
    }
    return this.instance;
  }

  getUserFeed(userId: string) {
    if (!this.usersFeedMap[userId])
      this.usersFeedMap[userId] = new Feed(
        new UserFeedQueryBuilder("Posts", userId),
        this.factory
      );
    return this.usersFeedMap[userId];
  }

  getHomeFeed() {
    if (!this._homeFeed)
      this._homeFeed = new Feed(
        new HomeFeedQueryBuilder("Posts", MyUser.getUser().getFriends()),
        this.factory
      );
    return this._homeFeed;
  }

  getDiscoveryFeed() {
    if (!this._discoveryFeed)
      this._discoveryFeed = new Feed(
        new DiscoveryQueryBuilder("Posts", MyUser.getUser().getFriends()),
        this.factory
      );
    return this._discoveryFeed;
  }

  deletePost(postId: string): void {
    this.getHomeFeed().delete(postId, false);
    this.usersFeedMap[MyUser.getUser()!.userInfo!.Username].delete(
      postId,
      true
    );
  }

  async publishPost(
    postText: string,
    photoUrl: string
  ): Promise<{ esito: boolean; message: string }> {
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
    } catch (e) {
      console.log("Errore", e);
      return { esito: false, message: "Si è verificato un errore" };
    }

    return { esito: true, message: "Post pubblicato!" };
  }
}
