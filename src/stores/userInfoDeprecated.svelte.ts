import { db } from "$lib/firebase/firebase.client";
import { FirestoreError, doc, onSnapshot } from "firebase/firestore";

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
