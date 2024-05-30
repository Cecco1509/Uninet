import { db } from "$lib/firebase/firebase.client";
import { collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, limit, orderBy, query, runTransaction, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { MyUser } from "./userState.svelte";

export class Post{

    private _data = $state<PostSchema>();
    private _id : string;
    private postRef : DocumentReference;
    private _liked = $state<boolean>();
    private likeRef : DocumentReference;
    private _comments = $state<CommentSchema[]>([]);

    constructor(postRef : DocumentReference, postData : PostSchema, postID : string){
        this.postRef = postRef;
        this._data = postData;
        this._id = postID;
        this.likeRef = doc(db, "Like", postID+"&"+ MyUser.getUser().user?.uid);
        //this.isliked();
        //this.initComments();
    }

    get post() : PostSchema { return this._data!;}
    get postId() : string { return this._id;}
    get data() : PostSchema {return this._data!;}
    get liked() : boolean {return this._liked!}

    private async isliked(){
        this._liked = (await getDoc(this.likeRef)).exists();
    }

    async like(){
        let modifier = 0;
        if(this._liked) modifier = -1;
        else modifier = 1;

        try{
            await runTransaction(db, async (transaction) => {
                const post = await transaction.get(this.postRef);
                if (!post.exists()) {
                    throw "Document does not exist!";
                }
            
                const newLikes = post.data().likes + modifier;
                transaction.update(this.postRef, { likes: newLikes });
                if(this._liked) transaction.delete(this.likeRef);
                else transaction.set(this.likeRef, {})
            });
            console.log("Transaction successfully committed!");
            this._liked = !this._liked;
            this._data!.likes += modifier;
        } catch (e) {
          console.log("Transaction failed: ", e);
        }
    }

    private async initComments(){
        
        const result = await getDocs(query(collection(db, "Posts"),
        where("postID", "==", this._id),
        orderBy("data", "desc"),
        limit(10)))

        result.forEach((comment) => {
            this._comments.push(comment.data() as CommentSchema);
        })
    }

    get comments(){
        return this._comments;
    }

    async comment(text: string, userID : string){
        try{
            const newComment = { testo : text, postID : this._id, data: Timestamp.fromDate(new Date()), commentID : "", userID: userID};
            const id = uuidv4();
            await setDoc(doc(db, "Comments", id), newComment);
            this._comments = [ {...newComment, ID: id}, ...this._comments];
        }catch(e){
            console.log("commento non riuscito", e);
        }
    }

    async edit(edits : Partial<PostSchema>){
        try{
            await updateDoc(this.postRef, edits);
            this._data = {...this._data!, ...edits};
        }catch(e){
            console.log("Not Updated", e);
        }
        
    }

    async delete(){
        try{
            deleteDoc(this.postRef);
            this._comments.forEach(comment => {
                deleteDoc(doc(db, "Comments", comment.ID))
            })
            //delete likes ma boh
        }catch(e){
            console.log(e);
        }
    }

}