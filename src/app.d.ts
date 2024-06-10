// See https://kit.svelte.dev/docs/types#app

import type { Timestamp } from "firebase/firestore";
import type { Chat } from "./stores/Chat.svelte";

// for information about these interfaces
declare global {
  type UserSchema = {
    displayName: string | null;
    photoURL: string | null;
    uid: string;
    email: string | null;
  };

  type CommentSchema = {
    commentID : string,
    testo : string,
    userID : string
    data : Timestamp
}

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
    birthday: {
      seconds: number;
      nanoseconds: number;
    };
    img: string | null;
    Bio: string;
    seguiti: number;
    Followers: number;
    Username: string;
    posts: number;
    id : string;
  } | null;

  type message = {
    text : string;
    timestamp : Database.Timestamp;
    sender : string
  }

  type chatInfo = {
    lastMessage : string;
    timestamp : string
  }

  type chatList = {
    [key : string] : Chat | undefined
  }

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
