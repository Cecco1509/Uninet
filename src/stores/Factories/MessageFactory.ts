import type { DocumentData, DocumentReference } from "firebase/firestore";
import type { FeedElement } from "../FeedElements/FeedElement.svelte";
import { Post } from "../FeedElements/Post.svelte";
import type { IFeedElementFactory } from "./IFeedElementFactory";
import type { DatabaseReference } from "firebase/database";
import { Message } from "../FeedElements/Message.svelte";

export class MessageFactory implements IFeedElementFactory {
  create(
    reference: DatabaseReference,
    data: MessageSchema,
    id: string
  ): Message {
    return new Message(reference, data as MessageSchema, id);
  }
}
