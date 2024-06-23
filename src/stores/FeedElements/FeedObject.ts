import type { Timestamp } from "firebase/firestore";

export interface FeedObject {
  data: Timestamp;
}

export interface FeedPostLikeObject extends FeedObject {
  img: string;
  createdBy: string;
  text: string;
}

export interface messageFeedObject extends FeedObject {
  text: string;
  sender: string;
}
