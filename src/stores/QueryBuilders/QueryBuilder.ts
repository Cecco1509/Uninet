import type { Query } from "firebase/firestore";
import type { Post } from "../Post.svelte";

export interface QueryBuilder{
    getQuery() : Promise<Query | null>
    getFetchQuery(post : Post) : Promise<Query | null>
}