import { db } from "$lib/firebase/firebase.client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { MyUser } from "./userState.svelte";
import { Feed } from "./Feed.svelte";
import { Post } from "./Post.svelte";
import { HomeFeedQueryBuilder } from "./QueryBuilders/HomeFeedQueryBuilder";
import { UserFeedQueryBuilder } from "./QueryBuilders/UserFeedQueryBuilder";
import { ChatStore } from "./ChatList.svelte";

type FeedMap = {
  [key: string]: Feed;
};

type UserInfoMap = {
  [key: string]: UserInfo;
};

export class DataBasaConn {
  private feedMap: FeedMap = {};
  private _homeFeed: Feed | null = null;
  private userInfos: UserInfoMap = {};

  private static instance: DataBasaConn;

  private constructor() {}

  static getDB() {
    if (!this.instance) {
      console.log("db created");
      this.instance = new DataBasaConn();
    }
    return this.instance;
  }

  getUserPosts(userId: string) {
    if (!this.feedMap[userId])
      this.feedMap[userId] = new Feed(new UserFeedQueryBuilder(userId));
    else console.log("not user");
    return this.feedMap[userId];
  }

  get homeFeed() {
    if (!this._homeFeed)
      this._homeFeed = new Feed(
        new HomeFeedQueryBuilder(MyUser.getUser().getFriends()),
      );
    else console.log("not feed");
    return this._homeFeed;
  }

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

  deletePost(postId: string): void {
    this.homeFeed?.deletePost(postId, false);
    this.feedMap[MyUser.getUser()!.userInfo!.Username].deletePost(postId, true);
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
      this.homeFeed!.addPost(newPost);

      //Aggiungo all'array dei post il post appena creato
      if (this.feedMap[MyUser.getUser().userInfo!.Username])
        this.feedMap[MyUser.getUser().userInfo!.Username].addPost(newPost);

      await MyUser.getUser().addPost();
      console.log("ADD request");
    } catch (e) {
      console.log("Errore", e);
    }
  }
}
