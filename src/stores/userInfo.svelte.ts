import { db } from "$lib/firebase/firebase.client";
import { FirestoreError, doc, onSnapshot } from "firebase/firestore";

export type UserInfo = {
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

export function getUserInfo(uid: string) {
  let data = $state<UserInfo>(null);

  $effect(() => {
    let unsubscribe = onSnapshot(doc(db, "Users", uid), (doc) => {
      data = doc.data() as UserInfo;
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
    get data() {
      return data;
    },
  };
}
