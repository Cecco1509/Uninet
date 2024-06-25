import type { IFeed } from "../Feeds/IFeed";

export interface FeedsCache {
  getHomeFeed(): IFeed;
  getUserFeed(user: string): IFeed;
  getDiscoveryFeed(): IFeed;
}
