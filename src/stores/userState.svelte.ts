import { auth, db } from "$lib/firebase/firebase.client";
import type { User } from "firebase/auth";
import { FirestoreError, doc, onSnapshot } from "firebase/firestore";

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
