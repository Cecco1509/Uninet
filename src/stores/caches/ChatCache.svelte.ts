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
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { onIdChange } from "firebase/installations";
import { UserInfosCache } from "./UserInfosCache.svelte";
import { MessageFactory } from "../Factories/MessageFactory";
import { ChatQueryBuilder } from "../QueryBuilders/ChatQueryBuilder";
import { GroupChatFeed } from "../Feeds/GroupChatFeed.svelte";
import User from "../../Components/User.svelte";

export type ChatMap = {
  [key: string]: ChatFeed | undefined;
};

export type GroupChatMap = {
  [key: string]: GroupChatFeed | undefined;
};

export class ChatCache {
  private _chats = $state<ChatMap>({});
  private _groupChats = $state<GroupChatMap>({});
  private unsubscribers: (() => void)[] = [];
  private groupUnsubscribers: (() => void)[] = [];
  private unsubscriber: (() => void) | null = null;
  private groupUnsubscriber: (() => void) | null = null;

  private static instance: ChatCache | null = null;

  static getCache() {
    if (!this.instance) this.instance = new ChatCache();
    return this.instance;
  }

  static getNowString() {
    const date = new Date();

    const strDate =
      date.getHours().toString().padStart(2, "0") +
      ":" +
      date.getMinutes().toString().padStart(2, "0") +
      " " +
      date.getDate().toString().padStart(2, "0") +
      "/" +
      date.getMonth().toString().padStart(2, "0") +
      "/" +
      date.getFullYear();
    return strDate;
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
                      new ChatQueryBuilder("messages", snapshot.key!, "", 30),
                      new MessageFactory()
                    );
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
                      new ChatQueryBuilder("messages", snapshot.key!, "", 30),
                      new MessageFactory()
                    );
                  }
                  console.log(partecipants[0]);
                }
              }
            }
          );
          this.unsubscribers.push(unsubscribe);
        });
      }
    );
  }

  private getGroupsUnsubscriber(): (() => void) | null {
    return onSnapshot(
      collection(db, "Users/" + MyUser.getUser().user?.uid + "/groupsChats"),
      (snapshot) => {
        snapshot.forEach((group) => {
          const unsubscribe = onSnapshot(
            doc(db, "groupsChatsInfo/", group.id),
            (snapshot) => {
              const groupInfo = snapshot.data() as groupChatInfo;
              if (this._groupChats[groupInfo.name]) {
                this._groupChats[groupInfo.name]!.chatInfo = groupInfo;
              } else
                this._groupChats[groupInfo.name] = new GroupChatFeed(
                  group.id,
                  groupInfo,
                  new ChatQueryBuilder(
                    "groupsMessages",
                    groupInfo.name,
                    "",
                    30
                  ),
                  new MessageFactory()
                );
            }
          );
          console.log("GROUP ADDED");
          this.groupUnsubscribers.push(unsubscribe);
        });
      }
    );
  }

  get chats() {
    if (this.unsubscribers.length > 0) return this._chats;

    this.unsubscriber = this.getUnsubscriber();
    // console.log("groupUnsubscriber getted chats");

    return this._chats;
  }

  get groupChats() {
    if (this.groupUnsubscribers.length > 0) return this._groupChats;

    this.groupUnsubscriber = this.getGroupsUnsubscriber();
    // console.log("UNSUB", this.groupUnsubscribers.length);
    // console.log("groupUnsubscriber getted groups");

    return this._groupChats;
  }

  getGroupChat(id: string) {
    return this._groupChats[id];
  }

  getChat(username: string) {
    // const unsubscribe = onValue(ref(realtimeDB, "chats/"+id), (snapshot => {
    //     if(snapshot.exists())
    //         this._chats[id] = new Chat(id, snapshot.val());
    //     else this._chats[id] = undefined;
    // }));

    return this._chats[username];
  }

  private async addChat(id: string, username: string) {
    await setDoc(
      doc(db, "Users/" + MyUser.getUser().user?.uid + "/chats", id),
      {}
    );
    const userInfo = await UserInfosCache.getCache()
      .getUserInfo(username, "addChat")
      .waitForComplete();
    await setDoc(doc(db, "Users/" + userInfo?.id + "/chats", id), {});
  }

  async addGroupChat(
    name: string,
    partecipants: string[],
    img: string
  ): Promise<{ created: boolean; errMessage: string }> {
    if (partecipants.length < 2)
      return { created: false, errMessage: "Partecipanti insufficienti" };

    if (
      this._groupChats[name] ||
      (await get(ref(realtimeDB, "groupsPartecipants/" + name))).exists()
    )
      return {
        created: false,
        errMessage: "Esiste già un gruppo con questo nome",
      };

    const group: groupChatInfo = {
      name: name,
      timestamp: ChatCache.getNowString(),
      lastMessage: "Creato",
      n_partecipants: partecipants.length + 1,
      img: img,
    };

    const reference = await addDoc(collection(db, "groupsChatsInfo"), group);

    const now = ChatCache.getNowString();

    await set(
      ref(
        realtimeDB,
        "groupsPartecipants/" +
          reference.id +
          "/" +
          MyUser.getUser().userInfo!.Username
      ),
      { timestamp: now }
    );

    partecipants.forEach(async (partecipant) => {
      const userInfo = await UserInfosCache.getCache()
        .getUserInfo(partecipant, "addGroupChat")
        .waitForComplete();
      await setDoc(
        doc(db, "Users/" + userInfo?.id + "/groupsChats", reference.id),
        {}
      );
      await set(
        ref(realtimeDB, "groupsPartecipants/" + name + "/" + partecipant),
        { timestamp: now }
      );
    });

    await setDoc(
      doc(
        db,
        "Users/" + MyUser.getUser().user?.uid + "/groupsChats",
        reference.id
      ),
      {}
    );

    await set(
      ref(
        realtimeDB,
        "groupsPartecipants/" + name + "/" + MyUser.getUser().userInfo?.Username
      ),
      { timestamp: now }
    );

    // this._groupChats[name] = new GroupChatFeed(
    //   reference.id,
    //   new ChatQueryBuilder("groupsMessages", name, "", 30),
    //   new MessageFactory()
    // );

    return { created: true, errMessage: "" };
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
      newChat.queryBuilder = new ChatQueryBuilder(
        "messages",
        newChat.id!,
        "",
        30
      );
      console.log(newChat.id);
    }

    console.log(this._chats[username]?.id);
    await set(ref(realtimeDB, "chats/" + this._chats[username]?.id), newInfo);

    /******** NOTIFICARE USER **********/
  }

  async setLastGroupMessage(id: string, newInfo: chatInfo) {
    if (this._groupChats[id])
      await updateDoc(
        doc(db, "groupsChatsInfo", this._groupChats[id].id!),
        newInfo
      );
    else console.log("ID", id, "Qualcosa è andato storto");

    /******** NOTIFICARE USER **********/
  }

  async join(name: string): Promise<{ joined: Boolean; errMessage: string }> {
    // check if the group exists in the cache
    if (this.groupChats[name])
      return { joined: false, errMessage: "Sei già un membro" };

    // check if the group exists in the database
    const q = query(
      collection(db, "groupsChatsInfo"),
      where("name", "==", name)
    );
    const res = await getDocs(q);
    let group: QueryDocumentSnapshot | undefined;
    res.forEach((doc) => {
      group = doc;
    });

    if (!group?.exists())
      return { joined: false, errMessage: "Il gruppo " + name + " non esiste" };

    // check if the user is already a member of this group

    if (
      (
        await get(
          ref(
            realtimeDB,
            "groupsPartecipants/" +
              name +
              "/" +
              MyUser.getUser().userInfo?.Username
          )
        )
      ).exists()
    )
      return { joined: false, errMessage: "Sei già un membro" };

    // add participant to the group realtime database

    await set(
      ref(
        realtimeDB,
        "groupsPartecipants/" + name + "/" + MyUser.getUser().userInfo?.Username
      ),
      { timestamp: ChatCache.getNowString() }
    );

    // add +1 to the number of participants
    // add group id to the user's group list

    await runTransaction(db, async (transaction) => {
      const updatedGroup = await transaction.get(group!.ref);
      transaction.update(updatedGroup.ref, {
        n_partecipants: updatedGroup.data()!.n_partecipants + 1,
      });
      transaction.set(
        doc(
          db,
          "Users/" + MyUser.getUser().user?.uid + "/groupsChats/" + group?.id
        ),
        {}
      );
    });

    return { joined: true, errMessage: "" };
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
