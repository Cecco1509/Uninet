// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  type UserType = {
    displayName: string | null;
    photoURL: string | null;
    uid: string;
    email: string | null;
  };

  type PostType = {
    comments: Number;
    data: { seconds: Number; nanoseconds: Number };
    img: string;
    likes: Number;
    text: string;
    userID: string;
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
