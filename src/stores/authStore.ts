import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  //updateEmail,
  updatePassword,
  type User,
} from "firebase/auth";
import { writable, type Writable } from "svelte/store";
import { auth } from "../lib/firebase/firebase.client";

type authType = {
  isLoading: boolean;
  currentUser: User | null | undefined;
};

export const authStore: Writable<authType> = writable<authType>({
  isLoading: true,
  currentUser: null,
});

export const authHandlers = {
  login: async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  },
  signup: async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },
  logout: async () => {
    await signOut(auth);
  },
  resetPassword: async (email: string) => {
    console.log("WE ARE HERE", email);
    if (!email) {
      console.log("inHERE");
      return;
    }
    await sendPasswordResetEmail(auth, email);
  },
  updateEmail: async (email: string) => {
    authStore.update((curr: authType): authType => {
      return {
        ...curr,
        currentUser: { ...curr.currentUser!, email: email },
      };
    });
    await updateEmail(auth.currentUser!, email);
  },
  updatePassword: async (password: string) => {
    await updatePassword(auth.currentUser as User, password);
  },
};
