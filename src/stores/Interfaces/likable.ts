export interface Likable {
  isLiked: boolean;
  like(): Promise<void>;
}
