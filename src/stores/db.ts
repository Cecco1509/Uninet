import { db } from "$lib/firebase/firebase.client";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
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
  lastSeen: PostSchema | null,
): Promise<{ posts: PostSchema[]; fetchedAll: boolean }> {
  const q = query(
    collection(db, "Posts"),
    where("createdBy", "==", username),
    orderBy("data"),
    startAfter(lastSeen?.data ? lastSeen.data : null),
    limit(10),
  );

  let posts: PostSchema[] = [];
  let i = 0;
  const result = await getDocs(q);

  result.forEach((row) => {
    posts.push({... row.data() as PostSchema, postID : row.id});
    i++;
  });

  return { posts: posts, fetchedAll: i < 10 };
}

export async function getUserFeed(
  username: string,
  lastSeen: PostSchema | null,
): Promise<PostSchema[]> {
  let posts: PostSchema[] = [];

  const friends: String[] = await getUserFriends(username);

  if (friends.length == 0) return [];

  try {
    const q = query(
      collection(db, "Posts"),
      where("createdBy", "in", friends),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      startAfter(lastSeen?.data ? lastSeen.data : null),
    );

    const result = await getDocs(q);

    result.forEach((row) => {
      posts.push({... row.data() as PostSchema, postID : row.id});
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
      console.log(row.id);
      friendsIDs.push((row.data() as FriendsSchema).friendUsername);
    });
  } catch (e) {
    console.log("Qualcosa è andato storto");
  }

  return friendsIDs;
}

export async function updatePost(postId: string, userId: string) {
  console.log(postId, userId);
}

export async function deletePost(postId: string, userId: string) {
  console.log(postId, userId);
}

