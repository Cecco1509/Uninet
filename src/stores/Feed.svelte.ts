import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { Post } from "./Post.svelte";
import { db } from "$lib/firebase/firebase.client";
import { MyUser } from "./userState.svelte";
import { DataBasaConn } from "./db.svelte";
import type { QueryBuilder } from "./QueryBuilders/QueryBuilder";

export class Feed{
    private _posts = $state<Post[]>([]);
    private _isLoading = $state(false);
    private queryBuilder : QueryBuilder;
    private _size = $state(0);
    private _fetchedAll = false;

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
                this._size += result.size;
                this._fetchedAll = this._size < 10 ? true : false;
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

    get size() : number{
        return this._size;
    }

    get fetchedAll() : boolean{
        return this._fetchedAll;
    }

    async loadNewPosts() : Promise<boolean>{
        if(this._fetchedAll) return true;

        const result = await getDocs(await this.queryBuilder.getFetchQuery(this._posts[this._posts.length - 1]));

        result.forEach(post => {
            this._posts.push(new Post(post.ref, post.data() as PostSchema, post.id))
            console.log(post.id)
        })

        this._size += result.size;
        this._fetchedAll = result.size < 10 ? true : false;

        return this._fetchedAll;
    }

    addPost(newPost: Post) {
        this._posts = [ newPost, ...this._posts]
    }

    deletePost(postId: string, deleteFromDB : boolean): void {
        this._posts = this._posts.filter((post, i, posts) => {
            if (post.postId == postId && post.data.createdBy == MyUser.getUser()!.userInfo!.Username){
                if (deleteFromDB) post.delete();
                return false;
            }else return true;
        });
    }

}
