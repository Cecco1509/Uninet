import type { Feed } from "../Feeds/Feed";

export interface FeedsCache {
  getHomeFeed(): Feed;
  getUserFeed(user: string): Feed;
  getDiscoveryFeed(): Feed;
}
