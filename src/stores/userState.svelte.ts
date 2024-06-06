import { auth, db } from "$lib/firebase/firebase.client";
import type { User } from "firebase/auth";
import { FirestoreError, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";

export class MyUser{
  
  private _user = $state<User | null | undefined>(undefined);
  private _userInfo = $state<UserInfo | null | undefined>(undefined);
  private isUserLoading = $state(true);
  private isInfoLoading = $state(true);
  private _isLoading = $derived(this.isInfoLoading || this.isUserLoading);
  private _friends : string[] = [];

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
        this._userInfo = doc.data() as UserInfo;
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

  async getFriends() : Promise<string[]> {
    if(this._friends.length > 0) {
      return this._friends;
    }

    const result = await getDocs(query(collection(db, "Friends"),where("username", "==", this._userInfo!.Username)));

    result.forEach(friend => {
      this._friends.push(friend.data().friendUsername);
    })

    return this._friends;
  }

  async addPost() {
    await updateDoc(doc(db, "Users", this._user!.uid), {posts : this._userInfo!.posts + 1});
  }

  async isFriend(username: string) : Promise<boolean>{
    await this.getFriends();
    this._friends.forEach((friend) => {
      if(friend == username) return true;
    })
    return false;
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