import { type Query, type DocumentData, query, collection, where, orderBy, limit, startAfter } from "firebase/firestore";
import type { QueryBuilder } from "./QueryBuilder";
import { db } from "$lib/firebase/firebase.client";
import { MyUser } from "../userState.svelte";
import type { Post } from "../Post.svelte";

export class UserFeedQueryBuilder implements QueryBuilder{

    private param : string;

    constructor(param : string){
        this.param = param;
    }

    async getFetchQuery(post : Post): Promise<Query> {

        console.log(post.postId);

        return query(
            collection(db, "Posts"),
            where("createdBy", "==", this.param),
            orderBy("data", "desc"),
            orderBy("likes", "desc"),
            startAfter(post.data.data),
            limit(10)
        );
    }


    async getQuery(): Promise<Query>{
        return query(
            collection(db, "Posts"),
            where("createdBy", "==", this.param),
            orderBy("data", "desc"),
            orderBy("likes", "desc"),
            limit(10)
        );
    }
    
}