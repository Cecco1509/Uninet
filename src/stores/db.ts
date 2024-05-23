import { db } from "$lib/firebase/firebase.client";
import {
  collection,
  query,
  where,
  getDocs,
  endAt,
  startAt,
  limit,
} from "firebase/firestore";
import { orderBy } from "firebase/firestore";

export async function getUserInfo(username: string): Promise<UserInfo | null> {
  const q = query(collection(db, "Users"), where("Username", "==", username));
  const result = await getDocs(q);
  let userData: UserInfo | null = null;

  if (result.empty) return null;
  result.forEach((row) => {
    userData = row.data() as UserInfo;
  });

  return userData;
}

export async function getUserPosts(
  username: string,
  offset: number,
): Promise<PostSchema[]> {
  const q = query(
    collection(db, "Posts"),
    where("createdBy", "==", username),
    orderBy("data"),
    startAt(offset),
    limit(10),
  );

  let posts: PostSchema[] = [];

  const result = await getDocs(q);

  result.forEach((row) => {
    posts.push(row.data() as PostSchema);
  });

  return posts;
}

export async function getUserFeed(
  username: string,
  offset: number,
): Promise<PostSchema[]> {
  let posts: PostSchema[] = [];

  const friends: String[] = await getUserFriends(username);

  console.log("friends: ", friends);

  if (friends.length == 0) return [];

  try {
    const q = query(
      collection(db, "Posts"),
      where("createdBy", "in", friends),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
    );

    const result = await getDocs(q);

    result.forEach((row) => {
      posts.push(row.data() as PostSchema);
    });
  } catch (e) {
    console.log(e);
  } finally {
    return posts;
  }
}

export async function getUserFriends(username: string): Promise<string[]> {
  let friendsIDs: string[] = [];

  const q = query(collection(db, "Friends"), where("username", "==", username));
  console.log("username: ", username);

  try {
    const result = await getDocs(q);
    result.forEach((row) => {
      friendsIDs.push((row.data() as FriendsSchema).friendUsername);
    });
  } catch (e) {
    console.log("Qualcosa è andato storto");
  }

  return friendsIDs;
}
