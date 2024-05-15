import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase/firebase.client";
import { FirebaseError } from "firebase/app";
import type { UserInfo } from "./db.svelte";

export class UserAuth {
  currentUser = $state<User | null>(null);
  userInfo = $state<UserInfo>();
  isLoading = $state<boolean>(false);
  error = $state<string>("");

  private static istance: UserAuth | null = null;

  static getUser() {
    if (!UserAuth.istance) UserAuth.istance = new UserAuth();
    return UserAuth.istance;
  }

  async login(email: string, password: string) {
    try {
      this.isLoading = true;
      this.currentUser = (
        await signInWithEmailAndPassword(auth, email, password)
      ).user;
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }

  async signup(email: string, password: string) {
    try {
      this.isLoading = true;
      this.currentUser = (
        await createUserWithEmailAndPassword(auth, email, password)
      ).user;
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      this.isLoading = true;
      await signOut(auth);
      console.log("OUT");
      this.currentUser = null;
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword(email: string) {
    try {
      this.isLoading = true;
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }

  async updateEmail(email: string) {
    try {
      this.isLoading = true;
      console.log(auth.currentUser);
      await updateEmail(auth.currentUser!, email);
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }

  async updatePassword(password: string) {
    try {
      this.isLoading = true;
      await updatePassword(auth.currentUser!, password);
    } catch (err) {
      this.error = (err as FirebaseError).code;
    } finally {
      this.isLoading = false;
    }
  }
}

export const authStore = UserAuth.getUser();
