import {
  DocumentReference,
  Query,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { Post } from "../FeedElements/Post.svelte";
import type { QueryBuilder } from "../QueryBuilders/QueryBuilder";
import { MyUser } from "../userState.svelte";
import type { Add, Delete, IFeed } from "./IFeed";
import { FeedElement } from "../FeedElements/FeedElement.svelte";
import type { IFeedElementFactory } from "../Factories/IFeedElementFactory";

export class Feed implements IFeed, Add, Delete {
  protected _elements = $state<FeedElement[]>([]);
  protected queryBuilder: QueryBuilder;
  protected _size = $state(0);
  protected _fetchedAll = $state(false);
  protected _factory: IFeedElementFactory;

  constructor(queryBuilder: QueryBuilder, factory: IFeedElementFactory) {
    this.queryBuilder = queryBuilder;
    this._factory = factory;
  }

  async getElements(): Promise<FeedElement[]> {
    if (this._size > 0 || this._fetchedAll) return this._elements;

    const q: Query | null = await this.queryBuilder.getQuery();

    if (!q) return this._elements;

    const result = await getDocs(q);
    //.then((result) => {
    console.log(result.size);
    result.forEach((element) => {
      const newElement = this.factory.create(
        element.ref,
        element.data(),
        element.id
      );

      this._elements.push(newElement);
      //DataBasaConn.getDB().getUserInfo(volantino.data().createdBy);
    });
    this._size += result.size;
    this._fetchedAll = this._size < this.queryBuilder.loadSize;

    //  });

    return this._elements;
  }

  get factory() {
    return this._factory;
  }

  // get isLoading() {
  //   return this._isLoading;
  // }

  // get posts(): Post[] {
  //   return this._elements;
  // }

  get size(): number {
    return this._size;
  }

  get fetchedAll(): boolean {
    return this._fetchedAll;
  }

  async loadMore(): Promise<void> {
    if (this._fetchedAll) return;

    const q = await this.queryBuilder.getFetchQuery(
      this._elements[this._elements.length - 1]
    );
    if (!q) return;

    const result = await getDocs(q);

    result.forEach((post) => {
      this._elements.push(this.factory.create(post.ref, post.data(), post.id));
      console.log(post.id);
    });

    this._size += result.size;
    this._fetchedAll = result.size < this.queryBuilder.loadSize;
  }

  add(element: FeedElement) {
    this._elements = [element, ...this._elements];
  }

  delete(id: string, deleteFromDB: boolean): void {
    this._elements = this._elements.filter((post, i, posts) => {
      if (
        post.id == id &&
        post.data.createdBy == MyUser.getUser()!.userInfo!.Username
      ) {
        if (deleteFromDB) post.delete();
        return false;
      } else return true;
    });
  }
}
