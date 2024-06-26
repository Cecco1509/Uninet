// See https://kit.svelte.dev/docs/types#app

import type { Timestamp } from "firebase/firestore";
import type { Chat } from "./stores/Feeds/ChatFeed.svelte";

// for information about these interfaces
declare global {
  type VolantinoSchema = {
    img: string;
    tags: string;
    text: string;
    createdBy: string;
    likes: number;
    data: Timestamp;
  };

  type UserSchema = {
    displayName: string | null;
    photoURL: string | null;
    uid: string;
    email: string | null;
  };

  type CommentSchema = {
    commentID: string;
    testo: string;
    userID: string;
    data: Timestamp;
  };

  type PostSchema = {
    comments: number;
    data: Timestamp;
    img: string;
    likes: number;
    text: string;
    userID: string;
    createdBy: string;
  };

  type UserInfo = {
    Nome: string;
    Cognome: string;
    birthday: Timestamp;
    img: string | null;
    Bio: string;
    seguiti: number;
    Followers: number;
    Username: string;
    posts: number;
    id: string;
    course: string;
    notify: boolean;
  } | null;

  type MessageSchema = {
    text: string;
    timestamp: string;
    sender: string;
  };

  type chatInfo = {
    lastMessage: string;
    timestamp: string;
  };

  type groupChatInfo = {
    name: string;
    lastMessage: string;
    timestamp: string;
    n_partecipants: number;
    img: string | null;
    sender: string;
  };

  type FriendsSchema = {
    username: string;
    friendUsername: string;
  };

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
