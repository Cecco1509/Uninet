import { db, storage } from "$lib/firebase/firebase.client";
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, limit, orderBy, query, runTransaction, setDoc, startAfter, Timestamp, updateDoc, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { MyUser } from "./userState.svelte";
import { deleteObject, ref } from "firebase/storage";

export class Post{
    private _data = $state<PostSchema>();
    private _id : string;
    private postRef : DocumentReference;
    private _liked = $state<boolean>();
    private likeRef : DocumentReference;
    private _comments = $state<CommentSchema[]>([]);
    private _fetchedAllComments = $state(false);

    constructor(postRef : DocumentReference, postData : PostSchema, postID : string){
        this.postRef = postRef;
        this._data = postData;
        this._id = postID;
        this.likeRef = doc(db, "/Posts/"+postID+"/Likes", MyUser.getUser().user!.uid);
        this.isliked();
        this.initComments().then(() => {
            this._fetchedAllComments = this._comments.length < 5;
        });
    }

    get post() : PostSchema { return this._data!;}
    get postId() : string { return this._id;}
    get data() : PostSchema {return this._data!;}
    get liked() : boolean {return this._liked!}
    get comments() : CommentSchema[] {return this._comments}
    get fetchedAllComments(){ return this._fetchedAllComments}

    private async isliked(){
        if(!this.likeRef) return false;
        this._liked = (await getDoc(this.likeRef)).exists();
    }

    async like(){

        let modifier = 0;
        if(this._liked) modifier = -1;
        else modifier = 1;

        this._liked = !this._liked;

        try{
            await runTransaction(db, async (transaction) => {
                //chiamata per prendere i likes correnti
                const post = await transaction.get(this.postRef);
                if (!post.exists()) {
                    throw "Document does not exist!";
                }

                transaction.update(this.postRef, { likes: post.data().likes + modifier });

                if(!this._liked) transaction.delete(this.likeRef);
                else transaction.set(this.likeRef, {})

                this._data!.likes = post.data().likes + modifier
                this._data!.comments = post.data().comments;
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            this._liked = !this._liked;
          console.log("Transaction failed: ", e);
        }
    }

    private async initComments(){
        
        const result = await getDocs(query(collection(db, "/Posts/"+this._id+"/Comments"),limit(5), orderBy("data", "desc"), where("commentID","==","")))

        result.forEach((comment) => {
            this._comments.push(comment.data() as CommentSchema);
        })

        //console.log(this._comments);
    }

    async publishComment(text: string){
        try{
            const newComment = { testo : text, postID : this._id, data: Timestamp.fromDate(new Date()), commentID : "", userID: MyUser.getUser().userInfo!.Username};
            await addDoc(collection(db, "/Posts/"+this._id+"/Comments"), newComment);

            await runTransaction(db, async (transaction) => {
                const post = await transaction.get(this.postRef);
                if (!post.exists()) {
                    throw "Document does not exist!";
                }

                transaction.update(this.postRef, { comments: post.data().comments + 1 });

                this._data!.likes = post.data().likes
                this._data!.comments = post.data().comments;
            });
            console.log("Commento riuscito");
            this._comments = [ newComment, ...this._comments];
        }catch(e){
            console.log("commento non riuscito", e);
        }
    }

    async edit(edits : Partial<PostSchema>){
        try{
            if (edits.img && this._data?.img) await deleteObject(ref(storage, this._data.img));
            await updateDoc(this.postRef, edits);
            this._data = {...this._data!, ...edits};
        }catch(e){
            console.log("Not Updated", e);
        }
    }

    async delete(){
        try{
            deleteDoc(this.postRef);
        }catch(e){
            console.log(e);
        }
    }

    async loadComments(){
        if(this._fetchedAllComments) return;

        const result = await getDocs(query(collection(db, "/Posts/"+this._id+"/Comments"),limit(5), orderBy("data", "desc"), startAfter(this._comments[this._comments.length -1].data), where("commentID","==","")))

        result.forEach(comment => {
            this._comments.push({...comment.data() as CommentSchema, commentID : comment.id})
        })

        this._fetchedAllComments = result.size < 5;

        return;
    }

}