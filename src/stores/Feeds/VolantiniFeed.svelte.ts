import { getDocs, getDocsFromCache, Query } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "$lib/firebase/firebase.client";
import type { Feed } from "./Feed";
import type { QueryBuilder } from "../QueryBuilders/QueryBuilder";
import type { FeedObject } from "../FeedElements/FeedObject";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import { Volantino } from "../FeedElements/Volantino.svelte";
import { MyUser } from "../userState.svelte";

export class VolantiniFeed implements Feed {
  private _cache = $state<Volantino[]>([]);
  private queryBuilder: QueryBuilder;
  private _size = $state(0);
  private _fetchedAll = false;

  constructor(queryBuilder: QueryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async getElements(): Promise<Volantino[]> {
    if (this._size > 0 || this._fetchedAll) return this._cache;

    const q: Query | null = await this.queryBuilder.getQuery();

    if (!q) return this._cache;

    getDocs(q).then((result) => {
      console.log(result.size);
      result.forEach((volantino) => {
        const newElement = new Volantino(
          volantino.ref,
          volantino.data() as VolantinoSchema,
          volantino.id
        );

        this._cache.push(newElement);
        //DataBasaConn.getDB().getUserInfo(volantino.data().createdBy);
      });
      this._size += result.size;
      this._fetchedAll = this._size < this.queryBuilder.loadSize;
    });

    return this._cache;
  }

  get size(): number {
    return this._size;
  }

  get fetchedAll(): boolean {
    return this._fetchedAll;
  }

  async loadMore(): Promise<boolean> {
    if (this._fetchedAll) return true;

    console.log("LOAD!!!!!!!");

    const q = await this.queryBuilder.getFetchQuery(
      this._cache[this._cache.length - 1]
    );
    if (!q) return false;

    const result = await getDocs(q);

    result.forEach((volantino) => {
      this._cache.push(
        new Volantino(
          volantino.ref,
          volantino.data() as VolantinoSchema,
          volantino.id
        )
      );
      console.log(volantino.id);
    });

    this._size += result.size;
    this._fetchedAll = result.size < this.queryBuilder.loadSize;

    return this._fetchedAll;
  }

  add(new_element: Volantino) {
    this._cache = [new_element, ...this._cache];
  }

  delete(id: string, deleteFromDB: boolean): void {
    this._cache = this._cache.filter((volantino, i, volantini) => {
      if (
        volantino.id == id &&
        volantino.data.createdBy == MyUser.getUser()!.userInfo!.Username
      ) {
        if (deleteFromDB) volantino.delete();
        return false;
      } else return true;
    });
  }
}
