import type { DocumentData, DocumentReference } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import type { DatabaseReference } from "firebase/database";

export interface IFeedElementFactory {
  create(
    reference: DocumentReference | DatabaseReference,
    data: DocumentData,
    id: string
  ): FeedElement;
}
