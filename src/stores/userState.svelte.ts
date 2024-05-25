import { auth, db } from "$lib/firebase/firebase.client";
import type { User } from "firebase/auth";
import { FirestoreError, doc, onSnapshot } from "firebase/firestore";

export class MyUser{
  private _user = $state<User | null | undefined>(undefined);
  private _userInfo = $state<UserInfo | null | undefined>(undefined);
  private isUserLoading = $state(true);
  private isInfoLoading = $state(true);
  private _isLoading = $derived(this.isInfoLoading || this.isUserLoading);

  private static instance : MyUser | null = null;

  public static getUser(): MyUser{
    if(!MyUser.instance) {MyUser.instance = new MyUser();}
    return MyUser.instance;
  }

  private constructor(){
    $effect(() => {
      this.isUserLoading = true;
      let fn = auth.onAuthStateChanged((new_user) => {
        this._user = new_user;
        this.isUserLoading = false;
      });
  
      return () => fn?.();
    });

    $effect(() => {
      this.isInfoLoading = true;
      if (this.isUserLoading) return;
      if (!this._user) {
        this.isInfoLoading = false;
        return;
      }
      let unsubscribe = onSnapshot(doc(db, "Users", this._user.uid), (doc) => {
        this._userInfo = doc.data() as UserInfo;;
        this.isInfoLoading = false;
      });
  
      return () => {
        try {
          unsubscribe?.();
        } catch (e) {
          console.log((e as FirestoreError).code);
        }
      };
    });
  }

  get userInfo() {
    return this._userInfo;
  }

  get user(){
    return this._user;
  }

  get isLoading() {
    return this._isLoading;
  }

}
/*
export function createUser() {
  let user = $state<User | null>(null);
  let userInfo = $state<UserInfo | null>(null);
  let isLoading = $state(true);
  let isInfoLoading = $state(true);

  $effect(() => {
    let fn = auth.onAuthStateChanged((new_user) => {
      user = new_user;
      isLoading = false;
    });

    return () => fn?.();
  });

  $effect(() => {
    if (isLoading) return;
    if (!user) {
      console.log(user);
      isInfoLoading = false;
      return;
    }
    let unsubscribe = onSnapshot(doc(db, "Users", user.uid), (doc) => {
      userInfo = doc.data() as UserInfo;
      console.log(userInfo);
      isInfoLoading = false;
    });

    return () => {
      try {
        unsubscribe?.();
      } catch (e) {
        console.log((e as FirestoreError).code);
      }
    };
  });

  return {
    get user() {
      return user;
    },
    get isLoading() {
      return isLoading || isInfoLoading;
    },
    get userInfo() {
      return userInfo;
    },
  };
}
*/