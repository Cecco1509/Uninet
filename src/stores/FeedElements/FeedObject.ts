import type { Timestamp } from "firebase/firestore";

export interface FeedObject {
  img: string;
  data: Timestamp;
  createdBy: string;
  text: string;
}
