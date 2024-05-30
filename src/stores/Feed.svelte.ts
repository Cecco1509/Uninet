import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { Post } from "./Post.svelte";
import { db } from "$lib/firebase/firebase.client";
import { MyUser } from "./userState.svelte";
import { DataBasaConn } from "./db.svelte";
import type { QueryBuilder } from "./QueryBuilders/QueryBuilder";

export class Feed{
    private _posts = $state<Post[]>([]);
    private _isLoading = $state(true);
    private queryBuilder : QueryBuilder;

    private static instance : Feed | null = null;

    constructor(queryBuilder : QueryBuilder){

        this.queryBuilder = queryBuilder;
        this._isLoading = true;
        this.queryBuilder.getQuery().then(q => {
            getDocs(q).then(result => {
                result.forEach(post => {
                    this._posts.push(new Post(post.ref, post.data() as PostSchema, post.id));
                    DataBasaConn.getDB().getUserInfo(post.data().createdBy);
                })
                this._isLoading = false;
            });
        })
        
    }

    get isLoading(){
        return this._isLoading;
    }


    get posts(): Post[] {
        return this._posts;
    }

    async loadNewPosts() : Promise<boolean>{

        this._isLoading = true;
        const result = await getDocs(await this.queryBuilder.getFetchQuery(this._posts[this._posts.length - 1]));

        result.forEach(post => {
            this._posts.push(new Post(post.ref, post.data() as PostSchema, post.id))
            console.log(post.id)
        })

        this._isLoading = false;
        if(result.size < 10) return true;
        else return false;
    }

    addPost(newPost: Post) {
        this._posts = [ newPost, ...this._posts]
    }

    deletePost(postId: string): void {
        this._posts = this._posts.filter((post, i, posts) => {
            if (post.postId == postId && post.data.createdBy == MyUser.getUser()!.userInfo!.Username){
                post.delete();
                return false;
            }else true;
        });

    }

}
