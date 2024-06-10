import { type Query, type DocumentData, query, collection, where, orderBy, limit, startAfter } from "firebase/firestore";
import type { QueryBuilder } from "./QueryBuilder";
import { db } from "$lib/firebase/firebase.client";
import { MyUser } from "../userState.svelte";
import type { Post } from "../Post.svelte";

export class HomeFeedQueryBuilder implements QueryBuilder{

    private param : Promise<string[]>;

    constructor(param : Promise<string[]>){
        this.param = param;
    }

    async getFetchQuery(post : Post): Promise<Query | null> {
        const result = await this.param;
        if(!result || result.length == 0) return null;


        return query(
            collection(db, "Posts"),
            where("createdBy", "in", result),
            orderBy("data", "desc"),
            orderBy("likes", "desc"),
            startAfter(post.data.data),
            limit(10)
        );
    }


    async getQuery(): Promise<Query | null>{
        const result = await this.param;
        if(!result || result.length == 0) return null;

        return query(
            collection(db, "Posts"),
            where("createdBy", "in", result),
            orderBy("data", "desc"),
            orderBy("likes", "desc"),
            limit(10)
        );
    }
    
}