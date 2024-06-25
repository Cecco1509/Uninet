import type { DocumentData, DocumentReference } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import { Post } from "../FeedElements/Post.svelte";
import type { IFeedElementFactory } from "./IFeedElementFactory";

export class FeedPostFactory implements IFeedElementFactory {
  create(reference: DocumentReference, data: PostSchema, id: string): Post {
    return new Post(reference, data as PostSchema, id);
  }
}
