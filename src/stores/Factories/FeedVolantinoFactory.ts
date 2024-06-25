import type { DocumentReference } from "firebase/firestore";
import { Post } from "../FeedElements/Post.svelte";
import type { IFeedElementFactory } from "./IFeedElementFactory";
import { Volantino } from "../FeedElements/Volantino.svelte";

export class FeedVolantinoFactory implements IFeedElementFactory {
  create(
    reference: DocumentReference,
    data: VolantinoSchema,
    id: string
  ): Volantino {
    return new Volantino(reference, data as VolantinoSchema, id);
  }
}
