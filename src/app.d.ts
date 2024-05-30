// See https://kit.svelte.dev/docs/types#app

import type { Timestamp } from "firebase/firestore";

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
    data : Timestamp, 
    ID : string
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
  } | null;

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
