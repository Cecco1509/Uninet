export interface Likable {
  isLiked(): Promise<boolean>;
  like(): Promise<void>;
}
