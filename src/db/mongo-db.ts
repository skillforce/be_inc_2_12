import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import { PostDBType } from "../entities/posts";
import { BlogDBType } from "../entities/blogs";
import { UserDBType } from "../entities/users";


let client:MongoClient = {} as MongoClient;

export let db:Db = {} as Db

export let blogCollection = {} as Collection<BlogDBType>
export let postCollection = {} as Collection<PostDBType>
export let usersCollection = {} as Collection<UserDBType>

export const connectToDB = async (MONGO_URL:string) => {
   try{
      client = new MongoClient(MONGO_URL);
      db= client.db(SETTINGS.DB_NAME)
      blogCollection = db.collection<BlogDBType>(SETTINGS.BLOG_COLLECTION_NAME)
      postCollection = db.collection<PostDBType>(SETTINGS.POST_COLLECTION_NAME)
      usersCollection = db.collection<UserDBType>(SETTINGS.USERS_COLLECTION_NAME)

       await client.connect()
       return true

   }catch (e) {
       console.log(e)
       await client.close();
       return false
   }
}