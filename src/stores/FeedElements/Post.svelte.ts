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
  deleteDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { MyUser } from "../userState.svelte";
import { FeedElement } from "./FeedElement.svelte";
import type { Likable } from "../Interfaces/likable";
import type { Delete } from "../Feeds/IFeed";
import { MenuStore } from "../Menu.svelte";

export class Post extends FeedElement implements Likable, Delete {
  private likeRef: DocumentReference;
  private _comments = $state<CommentSchema[]>([]);
  private _fetchedAllComments = $state(false);
  private ref: DocumentReference;
  private imgPath: string = "";
  private _isLiked = $state<boolean>(false);

  constructor(reference: DocumentReference, data: PostSchema, id: string) {
    super(data, id);
    this.ref = reference;

    this.likeRef = doc(
      db,
      "/Posts/" + id + "/Likes",
      MyUser.getUser().user!.uid
    );
    this.checkIfIsLiked();

    this.initComments().then(() => {
      this._fetchedAllComments = this._comments.length < 5;
    });

    if (!this._data!.img) return;

    this.imgPath = this._data!.img;
    this._data!.img = "";

    if (!MenuStore.getMenu().offline)
      getDownloadURL(ref(storage, this.imgPath))
        .then((url) => {
          this._data!.img = url;
        })
        .catch((e) => {
          console.log(e);
        });
  }

  get data() {
    return this._data as PostSchema;
  }

  async edit(edits: Partial<PostSchema>) {
    try {
      if (edits.img && this.data.img)
        await deleteObject(ref(storage, this.data.img));
      await updateDoc(this.ref, edits);
      this._data = { ...this._data!, ...edits };
    } catch (e) {
      console.log("Not Updated", e);
    }
  }

  private async checkIfIsLiked() {
    if (!this.likeRef) return;
    this._isLiked = (await getDoc(this.likeRef)).exists();
  }

  get isLiked() {
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

        (this._data as PostSchema)!.likes = post.data().likes + modifier;
        (this._data as PostSchema)!.comments = post.data().comments;
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

        this.data.likes = post.data().likes;
        this.data.comments = post.data().comments;
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

  async delete(): Promise<void> {
    try {
      await deleteDoc(this.ref);
      await updateDoc(doc(db, "Users/" + MyUser.getUser().user?.uid), {
        posts: MyUser.getUser().userInfo!.posts - 1,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
