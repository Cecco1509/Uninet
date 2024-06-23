import { db, storage } from "$lib/firebase/firebase.client";
import {
  DocumentReference,
  updateDoc,
  getDoc,
  runTransaction,
  doc,
  getDocs,
  Firestore,
  collection,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
  addDoc,
  startAfter,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { MyUser } from "../userState.svelte";
import { FeedElement } from "./FeedElement.svelte";
import type { Likable } from "../Interfaces/likable";
import { FeedPostLikeElement } from "./FeedPostLikeElement.svelte";

export class Post extends FeedPostLikeElement<PostSchema> implements Likable {
  private _isLiked = $state(false);
  private likeRef: DocumentReference;
  private _comments = $state<CommentSchema[]>([]);
  private _fetchedAllComments = $state(false);

  constructor(reference: DocumentReference, data: PostSchema, id: string) {
    super(reference, data, id);

    this.likeRef = doc(
      db,
      "/Posts/" + id + "/Likes",
      MyUser.getUser().user!.uid
    );
    this.isLiked();

    this.initComments().then(() => {
      this._fetchedAllComments = this._comments.length < 5;
    });
  }

  async edit(edits: Partial<PostSchema>) {
    try {
      if (edits.img && this._data?.img)
        await deleteObject(ref(storage, this._data.img));
      await updateDoc(this.ref, edits);
      this._data = { ...this._data!, ...edits };
    } catch (e) {
      console.log("Not Updated", e);
    }
  }

  async isLiked(): Promise<boolean> {
    if (!this.likeRef) return false;
    this._isLiked = (await getDoc(this.likeRef)).exists();
    return this._isLiked;
  }

  async like(): Promise<void> {
    let modifier = 0;
    if (this._isLiked) modifier = -1;
    else modifier = 1;

    this._isLiked = !this._isLiked;

    // fetch /api/likes/POST/postId&username // questa cosa sotto sarebbe da mettere nelle api
    try {
      await runTransaction(db, async (transaction) => {
        //chiamata per prendere i likes correnti
        const post = await transaction.get(this.ref);
        if (!post.exists()) {
          throw "Document does not exist!";
        }

        transaction.update(this.ref, {
          likes: post.data().likes + modifier,
        });

        if (!this._isLiked) transaction.delete(this.likeRef);
        else transaction.set(this.likeRef, {});

        this._data!.likes = post.data().likes + modifier;
        this._data!.comments = post.data().comments;
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      this._isLiked = !this._isLiked;
      console.log("Transaction failed: ", e);
    }
  }

  get comments() {
    return this._comments;
  }

  get fetchedAllComments() {
    return this._fetchedAllComments;
  }
  private async initComments() {
    const result = await getDocs(
      query(
        collection(db, "/Posts/" + this._id + "/Comments"),
        limit(5),
        orderBy("data", "desc"),
        where("commentID", "==", "")
      )
    );

    result.forEach((comment) => {
      this._comments.push(comment.data() as CommentSchema);
    });

    //console.log(this._comments);
  }

  async publishComment(text: string) {
    try {
      const newComment = {
        testo: text,
        postID: this._id,
        data: Timestamp.fromDate(new Date()),
        commentID: "",
        userID: MyUser.getUser().userInfo!.Username,
      };
      await addDoc(
        collection(db, "/Posts/" + this._id + "/Comments"),
        newComment
      );

      await runTransaction(db, async (transaction) => {
        const post = await transaction.get(this.ref);
        if (!post.exists()) {
          throw "Document does not exist!";
        }

        transaction.update(this.ref, {
          comments: post.data().comments + 1,
        });

        this._data!.likes = post.data().likes;
        this._data!.comments = post.data().comments;
      });
      console.log("Commento riuscito");
      this._comments = [newComment, ...this._comments];
    } catch (e) {
      console.log("commento non riuscito", e);
    }
  }

  async loadComments() {
    if (this._fetchedAllComments) return;

    const result = await getDocs(
      query(
        collection(db, "/Posts/" + this._id + "/Comments"),
        limit(5),
        orderBy("data", "desc"),
        startAfter(this._comments[this._comments.length - 1].data),
        where("commentID", "==", "")
      )
    );

    result.forEach((comment) => {
      this._comments.push({
        ...(comment.data() as CommentSchema),
        commentID: comment.id,
      });
    });

    this._fetchedAllComments = result.size < 5;

    return;
  }
}
