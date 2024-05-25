// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  type UserSchema = {
    displayName: string | null;
    photoURL: string | null;
    uid: string;
    email: string | null;
  };

  type PostSchema = {
    comments: Number;
    data: { seconds: Number; nanoseconds: Number };
    img: string;
    likes: Number;
    text: string;
    userID: string;
    createdBy: string;
    postID: string;
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
