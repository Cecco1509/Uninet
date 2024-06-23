import { Query, getDocs } from "firebase/firestore";
import { Post } from "../FeedElements/Post.svelte";
import type { QueryBuilder } from "../QueryBuilders/QueryBuilder";
import { MyUser } from "../userState.svelte";
import type { Add, Delete, Feed } from "./Feed";

export class PostsFeed implements Feed, Add, Delete {
  private _posts = $state<Post[]>([]);
  private queryBuilder: QueryBuilder;
  private _size = $state(0);
  private _fetchedAll = $state(false);

  constructor(queryBuilder: QueryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async getElements(): Promise<Post[]> {
    if (this._size > 0 || this._fetchedAll) return this._posts;

    const q: Query | null = await this.queryBuilder.getQuery();

    if (!q) return this._posts;

    getDocs(q).then((result) => {
      console.log(result.size);
      result.forEach((volantino) => {
        const newElement = new Post(
          volantino.ref,
          volantino.data() as PostSchema,
          volantino.id
        );

        this._posts.push(newElement);
        //DataBasaConn.getDB().getUserInfo(volantino.data().createdBy);
      });
      this._size += result.size;
      this._fetchedAll = this._size < this.queryBuilder.loadSize;
    });

    return this._posts;
  }

  // get isLoading() {
  //   return this._isLoading;
  // }

  // get posts(): Post[] {
  //   return this._posts;
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
      this._posts[this._posts.length - 1]
    );
    if (!q) return;

    const result = await getDocs(q);

    result.forEach((post) => {
      this._posts.push(new Post(post.ref, post.data() as PostSchema, post.id));
      console.log(post.id);
    });

    this._size += result.size;
    this._fetchedAll = result.size < this.queryBuilder.loadSize;
  }

  add(new_element: Post) {
    this._posts = [new_element, ...this._posts];
  }

  delete(id: string, deleteFromDB: boolean): void {
    this._posts = this._posts.filter((post, i, posts) => {
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
