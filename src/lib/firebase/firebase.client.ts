// Import the functions you need from the SDKs you need
import {
  deleteApp,
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";
import { Database, getDatabase, onValue, ref } from "firebase/database";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  databaseURL: import.meta.env.VITE_DATABASEURL,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
  deleteApp(firebaseApp);
  firebaseApp = initializeApp(firebaseConfig);
  //firestoreDB = initializeFirestore(firebaseApp, {localCache: persistentLocalCache({}), })
}

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore();
export const storage: FirebaseStorage = getStorage();
export const realtimeDB: Database = getDatabase();

const connectedRef = ref(realtimeDB, ".info/connected");

onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("connected");
  } else {
    console.log("not connected");
  }
});
