import {
  get,
  limitToFirst,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";
import { MyUser } from "../userState.svelte";
import { db, realtimeDB } from "$lib/firebase/firebase.client";
import { ChatFeed } from "../Feeds/ChatFeed.svelte";
import {
  addDoc,
  collection,
  collectionGroup,
  CollectionReference,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { onIdChange } from "firebase/installations";
import { UserInfosCache } from "./UserInfosCache.svelte";
import { MessageFactory } from "../Factories/MessageFactory";
import { UserChatQueryBuilder } from "../QueryBuilders/UserChatQueryBuilder";

export type chatMap = {
  [key: string]: ChatFeed | undefined;
};

export class ChatCache {
  private _chats = $state<chatMap>({});
  private unsubscribers: (() => void)[] = [];
  private unsubscriber: (() => void) | null = null;

  private static instance: ChatCache | null = null;

  static getCache() {
    if (!this.instance) this.instance = new ChatCache();
    return this.instance;
  }

  private constructor() {}

  private getUnsubscriber() {
    return onSnapshot(
      collection(db, "Users/" + MyUser.getUser().user?.uid + "/chats"),
      (snapshot) => {
        snapshot.forEach((chatId) => {
          const unsubscribe = onValue(
            ref(realtimeDB, "chats/" + chatId.id),
            (snapshot) => {
              if (snapshot.exists()) {
                const partecipants = snapshot.key!.split("&");
                if (MyUser.getUser().userInfo!.Username == partecipants[0]) {
                  if (this._chats[partecipants[1]]) {
                    this._chats[partecipants[1]]!.chatInfo =
                      snapshot.val() as chatInfo;
                  } else {
                    this._chats[partecipants[1]] = new ChatFeed(
                      snapshot.key!,
                      partecipants[1],
                      snapshot.val(),
                      new UserChatQueryBuilder(
                        "messages",
                        snapshot.key!,
                        "",
                        30
                      ),
                      new MessageFactory()
                    );
                    this.unsubscribers.push(unsubscribe);
                  }
                  console.log(partecipants[1]);
                } else {
                  if (this._chats[partecipants[0]]) {
                    this._chats[partecipants[0]]!.chatInfo =
                      snapshot.val() as chatInfo;
                  } else {
                    this._chats[partecipants[0]] = new ChatFeed(
                      snapshot.key!,
                      partecipants[0],
                      snapshot.val(),
                      new UserChatQueryBuilder(
                        "messages",
                        snapshot.key!,
                        "",
                        30
                      ),
                      new MessageFactory()
                    );
                    this.unsubscribers.push(unsubscribe);
                  }
                  console.log(partecipants[0]);
                }
              }
            }
          );
        });
      }
    );
  }

  get chats() {
    if (this.unsubscribers.length > 0) return this._chats;

    this.unsubscriber = this.getUnsubscriber();

    return this._chats;
  }

  getChat(username: string) {
    // const unsubscribe = onValue(ref(realtimeDB, "chats/"+id), (snapshot => {
    //     if(snapshot.exists())
    //         this._chats[id] = new Chat(id, snapshot.val());
    //     else this._chats[id] = undefined;
    // }));

    return this._chats[username];
  }

  async addChat(id: string, username: string) {
    await setDoc(
      doc(db, "Users/" + MyUser.getUser().user?.uid + "/chats", id),
      {}
    );
    const userInfo = await UserInfosCache.getCache().getUserInfo(username);
    await setDoc(doc(db, "Users/" + userInfo?.id + "/chats", id), {});
  }

  async setLastMessage(
    username: string,
    newInfo: chatInfo,
    newChat: ChatFeed | null = null
  ) {
    if (!this._chats[username] && newChat) {
      this._chats[username] = newChat;
      newChat.setId(MyUser.getUser().userInfo!.Username + "&" + username);
      await this.addChat(newChat.id!, username);
      newChat.factory = new MessageFactory();
      newChat.queryBuilder = new UserChatQueryBuilder(
        "messages",
        newChat.id!,
        "",
        30
      );
      console.log(newChat.id);
    }

    console.log(this._chats[username]?.id);
    await set(ref(realtimeDB, "chats/" + this._chats[username]?.id), newInfo);
  }

  // async addChat(searchUser : string, initInfo : chatInfo) {

  //     //AGGIUNGERE CONTROLLI DI SICUREZZA

  //     console.log(MyUser.getUser().userInfo?.Username+"&"+searchUser)

  //     // Controllo se esiste
  //     if(this._chats[searchUser+"&"+MyUser.getUser().userInfo?.Username]) return searchUser+"&"+MyUser.getUser().userInfo?.Username;
  //     if(this._chats[MyUser.getUser().userInfo?.Username+"&"+searchUser]) return MyUser.getUser().userInfo?.Username+"&"+searchUser;

  //     set(ref(realtimeDB, "chats/" + MyUser.getUser().userInfo?.Username+"&"+searchUser), initInfo)

  //     setDoc(doc(db, "Users/"+MyUser.getUser().user?.uid+"/chats", MyUser.getUser().userInfo?.Username+"&"+searchUser), {});

  //     return MyUser.getUser().userInfo?.Username+"&"+searchUser
  // }
}
