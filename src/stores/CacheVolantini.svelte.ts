import { db, storage } from "$lib/firebase/firebase.client";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from "firebase/firestore";
import { MyUser } from "./userState.svelte";
import type { NumericRange } from "@sveltejs/kit";
import { getDownloadURL, ref } from "firebase/storage";

export type Volantino = {
  id: string;
  img: string;
  tags: string;
  titolo: string;
  createdBy: string;
  likes: number;
  data: Timestamp;
};

export type Volantini = {
  [key: string]: Volantino;
};

export class CacheVolantini {
  private _cache = $state<Volantino[]>([]);
  private _size = $state<number>(0); //Molto probabilmente è inutile
  private _isFetchedAll = $state(false);
  private static instance: CacheVolantini | null = null;

  static getCache(): CacheVolantini {
    if (!this.instance) this.instance = new CacheVolantini();
    return this.instance!;
  }

  constructor() {
    //         addDoc(collection(db, "Volantini"), {
    // createdBy : "bru123",
    // data : Timestamp.fromDate(new Date()),
    // img : "",
    // recapito : "3473756586",
    // tags :"",
    // titolo : "Primo volantino"})
    //
  }

  get size() {
    return this._size;
  }

  get isFetchedAll() {
    return this._isFetchedAll;
  }

  async getVolantini(): Promise<Volantino[]> {
    if (this.isFetchedAll || this._size > 0) return this._cache;

    const friends = await MyUser.getUser().getFriends();

    const q = query(
      collection(db, "Volantini"),
      where("createdBy", "in", friends),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      limit(10)
    );

    getDocs(q).then((result) => {
      result.forEach((volantino) => {
        const data = { ...(volantino.data() as Volantino), id: volantino.id };

        // Se l'immagine non esiste ritorna subito
        if (!data.img) {
          this._cache.push(data);
          return;
        }

        // Se l'immagine esiste cerca il link di download (Potrei farlo meglio forse ???)
        getDownloadURL(ref(storage, data.img))
          .then((url) => {
            data.img = url;
            this._cache.push(data);
          })
          .catch((e) => {
            console.log(e);
          });
      });

      this._size += result.size;
      if (result.size < 10) this._isFetchedAll = true;
    });

    return this._cache;
  }

  async loadMore() {
    if (this._isFetchedAll) return;

    const friends = await MyUser.getUser().getFriends();

    const q = query(
      collection(db, "Volantini"),
      where("createdBy", "in", friends),
      orderBy("data", "desc"),
      orderBy("likes", "desc"),
      startAfter(this._cache[this._cache.length].data)
    );

    getDocs(q).then((result) => {
      result.forEach((volantino) => {
        const data = { ...(volantino.data() as Volantino), id: volantino.id };

        // Se l'immagine non esiste ritorna subito
        if (!data.img) {
          this._cache.push(data);
          return;
        }

        // Se l'immagine esiste cerca il link di download (Potrei farlo meglio forse ???)
        getDownloadURL(ref(storage, data.img))
          .then((url) => {
            data.img = url;
            this._cache.push(data);
          })
          .catch((e) => {
            console.log(e);
          });
      });

      this._size += result.size;
      if (result.size < 10) this._isFetchedAll = true;
    });
  }
}
