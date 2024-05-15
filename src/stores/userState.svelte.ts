import { auth } from "$lib/firebase/firebase.client";
import { onAuthStateChanged, type User } from "firebase/auth";

export function createUser() {
  let user = $state<User | null>(null);
  let isLoading = $state(true);

  $effect(() => {
    let fn = auth.onAuthStateChanged((new_user) => {
      user = new_user;
      isLoading = false;
    });

    return () => fn?.();
  });

  return {
    get user() {
      return user;
    },
    get isLoading() {
      return isLoading;
    },
  };
}
